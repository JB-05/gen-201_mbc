'use client';

import { useState, useEffect, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { initializePayment, createRazorpayInstance, verifyPayment, loadRazorpayScript } from '@/lib/services/payment';
import { TermsModal } from './TermsModal';
import { registerTeam, checkTeamNameAvailability } from '@/lib/services/registration';
// import { zodResolver } from '@hookform/resolvers/zod'; // Removed to prevent typing lag
// import * as z from 'zod'; // Removed to prevent typing lag
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/custom-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import type { RegistrationFormData } from '@/types/registration';

// Validation Schema - REMOVED to prevent typing lag

export function RegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isLoadingRazorpay, setIsLoadingRazorpay] = useState(false);


  // Initialize with fallback districts immediately
  const [districts, setDistricts] = useState<Array<{id: string, name: string}>>([
    { id: '1', name: 'Alappuzha' },
    { id: '2', name: 'Ernakulam' },
    { id: '3', name: 'Idukki' },
    { id: '4', name: 'Kannur' },
    { id: '5', name: 'Kasaragod' },
    { id: '6', name: 'Kollam' },
    { id: '7', name: 'Kottayam' },
    { id: '8', name: 'Kozhikode' },
    { id: '9', name: 'Malappuram' },
    { id: '10', name: 'Palakkad' },
    { id: '11', name: 'Pathanamthitta' },
    { id: '12', name: 'Thiruvananthapuram' },
    { id: '13', name: 'Thrissur' },
    { id: '14', name: 'Wayanad' },
  ]);

  // Debug: Log districts when they change
  useEffect(() => {
    // console.log('Districts state updated:', districts); // Removed for production security
  }, [districts]);

  useEffect(() => {
    const loadRazorpaySDK = async () => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        return;
      }

      setIsLoadingRazorpay(true);
      try {
        await loadRazorpayScript();
        setIsRazorpayLoaded(true);
      } catch (error) {
        console.error('Failed to load Razorpay SDK:', error);
        toast.error('Failed to load payment system. Please refresh the page or try again later.');
      } finally {
        setIsLoadingRazorpay(false);
      }
    };

    if (currentStep === 4) {
      loadRazorpaySDK();
    }
  }, [currentStep]);

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        console.log('Loading districts from database...');
        const { getActiveDistricts } = await import('@/lib/services/config');
        const activeDistricts = await getActiveDistricts();
        // console.log('Loaded districts:', activeDistricts); // Removed for production security
        
        if (activeDistricts && activeDistricts.length > 0) {
          setDistricts(activeDistricts.map(d => ({ id: d.id, name: d.name })));
        } else {
          console.log('No districts found in database, using fallback...');
          throw new Error('No districts in database');
        }
      } catch (error) {
        console.error('Failed to load districts from database:', error);
        console.log('Using fallback districts...');
        // Fallback to hardcoded districts if config fails
        setDistricts([
          { id: '1', name: 'Alappuzha' },
          { id: '2', name: 'Ernakulam' },
          { id: '3', name: 'Idukki' },
          { id: '4', name: 'Kannur' },
          { id: '5', name: 'Kasaragod' },
          { id: '6', name: 'Kollam' },
          { id: '7', name: 'Kottayam' },
          { id: '8', name: 'Kozhikode' },
          { id: '9', name: 'Malappuram' },
          { id: '10', name: 'Palakkad' },
          { id: '11', name: 'Pathanamthitta' },
          { id: '12', name: 'Thiruvananthapuram' },
          { id: '13', name: 'Thrissur' },
          { id: '14', name: 'Wayanad' },
        ]);
      }
    };

    loadDistricts();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<RegistrationFormData>({
    // resolver: zodResolver(registrationSchema), // Removed to prevent typing lag
    mode: "onSubmit", // Only validate on submit
    reValidateMode: "onSubmit", // Re-validate only on submit
    defaultValues: {
      teamMembers: [{}],
      teacherVerification: {
        salutation: 'sir',
        name: '',
        phone: '',
      },
      projectDetails: {
        ideaTitle: '',
        problemStatement: '',
        solutionIdea: '',
        implementationPlan: '',
        beneficiaries: '',
        teamworkContribution: '',
        termsAccepted: false,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teamMembers',
  });


  // Store form data for payment processing
  const [formDataForPayment, setFormDataForPayment] = useState<RegistrationFormData | null>(null);

  const handlePaymentInitiation = async (data: RegistrationFormData) => {
    console.log('Payment initiation started');
    console.log('Razorpay loaded:', isRazorpayLoaded);
    // console.log('Razorpay key available:', !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID); // Removed for production security
    
    if (!isRazorpayLoaded) {
      toast.error('Payment system is not ready. Please wait or refresh the page.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    try {
      setIsSubmitting(true);
      await handlePayment(data);
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error(error.message || 'Failed to start payment process. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (data: RegistrationFormData) => {
    // console.log('handlePayment called with data:', data); // Removed for production security
    setIsSubmitting(true);
    
    // Check if Razorpay is configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error('Razorpay key not configured');
      toast.error('Payment system is not configured. Please contact support.');
      setIsSubmitting(false);
      return;
    }
    
    console.log('Razorpay key found, initializing payment...');
    
    try {
      // Initialize payment
      console.log('Calling initializePayment...');
      const { success, orderId, error } = await initializePayment({
        teamName: data.teamName,
        email: data.teamLead.email,
        phone: data.teamLead.phone,
      });

      if (!success || !orderId) {
        throw new Error(error || 'Failed to initialize payment');
      }

      // Create Razorpay instance
      console.log('Creating Razorpay instance with orderId:', orderId);
      const razorpay = await createRazorpayInstance(
        orderId,
        {
          teamName: data.teamName,
          email: data.teamLead.email,
          phone: data.teamLead.phone,
        },
        async (response) => {
          // On successful payment
          try {
            // Verify payment
            const verificationResult = await verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (!verificationResult.success) {
              throw new Error('Payment verification failed');
            }

            // Prepare data mappings
            const transformedMembers = [
              { ...data.teamLead, is_team_lead: true },
              ...data.teamMembers,
            ].map((m) => ({
              ...m,
              food_preference: m.foodPreference === 'non-veg' ? 'non_veg' : (m.foodPreference ?? 'none'),
            }));

            // Register team with payment details
            const registrationResult = await registerTeam(
              {
                team_name: data.teamName,
                school_name: data.school,
                school_district: data.district,
                lead_phone: data.teamLead.phone,
                lead_email: data.teamLead.email,
              },
              transformedMembers as any,
              {
                idea_title: data.projectDetails.ideaTitle,
                problem_statement: data.projectDetails.problemStatement,
                solution_idea: data.projectDetails.solutionIdea,
                implementation_plan: data.projectDetails.implementationPlan,
                beneficiaries: data.projectDetails.beneficiaries,
                teamwork_contribution: data.projectDetails.teamworkContribution,
              },
              {
                salutation: data.teacherVerification.salutation,
                teacher_name: data.teacherVerification.name,
                teacher_phone: data.teacherVerification.phone,
              },
              {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              }
            );

            if (registrationResult.success) {
              // Persist success payload for success page
              try {
                const successPayload = {
                  team: {
                    team_name: data.teamName,
                    school_name: data.school,
                    school_district: data.district,
                    lead_phone: data.teamLead.phone,
                    lead_email: data.teamLead.email,
                  },
                  members: transformedMembers,
                  project: {
                    idea_title: data.projectDetails.ideaTitle,
                    problem_statement: data.projectDetails.problemStatement,
                    solution_idea: data.projectDetails.solutionIdea,
                    implementation_plan: data.projectDetails.implementationPlan,
                    beneficiaries: data.projectDetails.beneficiaries,
                    teamwork_contribution: data.projectDetails.teamworkContribution,
                  },
                  teacher: {
                    salutation: data.teacherVerification.salutation,
                    teacher_name: data.teacherVerification.name,
                    teacher_phone: data.teacherVerification.phone,
                  },
                  payment: {
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                  },
                  meta: {
                    teamId: registrationResult.teamId,
                    teamCode: (() => {
                      try {
                        const district = data.district.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
                        const shortId = (registrationResult.teamId || '').replace(/-/g, '').slice(0, 6).toUpperCase();
                        return shortId ? `GEN201-${district}-${shortId}` : undefined;
                      } catch {
                        return undefined;
                      }
                    })(),
                    createdAt: new Date().toISOString(),
                  },
                };
                sessionStorage.setItem('gen201_registration_success', JSON.stringify(successPayload));
              } catch (e) {
                console.error('Failed to store success payload', e);
              }

              // Show success message with more details
              toast.success(
                `🎉 Registration successful! Team ID: ${registrationResult.teamId}. Check your email for confirmation.`,
                { duration: 6000 }
              );
              
              // Reset form and go back to first step
              reset();
              setCurrentStep(1);
              
              // Redirect to success page
              router.push('/register/success');
            } else {
              throw new Error(registrationResult.error || 'Registration failed');
            }
          } catch (error: any) {
            toast.error(error.message || 'Registration failed. Please contact support.');
          } finally {
            setIsSubmitting(false);
          }
        },
        (error) => {
          // On payment failure
          console.error('Payment failed:', error);
          let errorMessage = 'Payment failed. Please try again.';
          
          if (error.code === 'BAD_REQUEST_ERROR') {
            errorMessage = 'Invalid payment details. Please check your information.';
          } else if (error.code === 'GATEWAY_ERROR') {
            errorMessage = 'Payment gateway error. Please try again later.';
          } else if (error.code === 'NETWORK_ERROR') {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (error.description) {
            errorMessage = error.description;
          }
          
          toast.error(errorMessage);
          setIsSubmitting(false);
        }
      );

      // Open Razorpay payment form
      console.log('Opening Razorpay payment gateway...');
      razorpay.open();
      console.log('Razorpay.open() called');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const MemberForm = memo(({ isTeamLead = false, index = 0 }: { isTeamLead?: boolean; index?: number }) => (
    <div className="space-y-4 p-4 sm:p-6 bg-black/30 backdrop-blur-sm border border-[#7303c0] clip-polygon">
      <h3 className="font-orbitron text-xl text-[#928dab] mb-4">
        {isTeamLead ? 'Team Lead Details' : `Team Member ${index + 1}`}
      </h3>

      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <CustomInput
            {...register(isTeamLead ? 'teamLead.name' : `teamMembers.${index}.name`, { required: 'Name is required' })}
            placeholder="Full Name"
            type="text"
            className="bg-black/50 border-[#7303c0] text-white w-full"
            autoComplete="name"
          />
          {isTeamLead ? (
            errors?.teamLead?.name && (
              <span className="text-red-500 text-sm">{errors.teamLead.name.message}</span>
            )
          ) : (
            errors?.teamMembers?.[index]?.name && (
              <span className="text-red-500 text-sm">{errors.teamMembers[index]?.name?.message}</span>
            )
          )}
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-[#928dab] mb-3">Gender</label>
          <Controller
            name={isTeamLead ? 'teamLead.gender' : `teamMembers.${index}.gender`}
            control={control}
            rules={{ required: 'Gender is required' }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id={`gender-male-${index}`} />
                  <label htmlFor={`gender-male-${index}`} className="text-white cursor-pointer">Male</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id={`gender-female-${index}`} />
                  <label htmlFor={`gender-female-${index}`} className="text-white cursor-pointer">Female</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id={`gender-other-${index}`} />
                  <label htmlFor={`gender-other-${index}`} className="text-white cursor-pointer">Other</label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-medium text-[#928dab] mb-3">Grade</label>
          <Controller
            name={isTeamLead ? 'teamLead.grade' : `teamMembers.${index}.grade`}
            control={control}
            rules={{ required: 'Grade is required' }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="11" id={`grade-11-${index}`} />
                  <label htmlFor={`grade-11-${index}`} className="text-white cursor-pointer">Grade 11</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12" id={`grade-12-${index}`} />
                  <label htmlFor={`grade-12-${index}`} className="text-white cursor-pointer">Grade 12</label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CustomInput
              {...register(isTeamLead ? 'teamLead.phone' : `teamMembers.${index}.phone`, { required: 'Phone is required', pattern: { value: /^[0-9]{10}$/, message: 'Enter 10-digit phone' } })}
              placeholder="WhatsApp Number"
              type="tel"
              inputMode="numeric"
              className="bg-black/50 border-[#7303c0] text-white w-full"
              autoComplete="tel"
            />
            {isTeamLead
              ? errors?.teamLead?.phone && (
                  <span className="text-red-500 text-sm">{errors.teamLead.phone.message as string}</span>
                )
              : errors?.teamMembers?.[index]?.phone && (
                  <span className="text-red-500 text-sm">{errors?.teamMembers?.[index]?.phone?.message as unknown as string}</span>
                )}
          </div>

          <div>
            <CustomInput
              {...register(isTeamLead ? 'teamLead.email' : `teamMembers.${index}.email`, { required: 'Email is required', pattern: { value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: 'Enter a valid email' } })}
              placeholder="Email Address"
              type="email"
              className="bg-black/50 border-[#7303c0] text-white w-full"
              autoComplete="email"
            />
            {isTeamLead
              ? errors?.teamLead?.email && (
                  <span className="text-red-500 text-sm">{errors.teamLead.email.message as string}</span>
                )
              : errors?.teamMembers?.[index]?.email && (
                  <span className="text-red-500 text-sm">{errors?.teamMembers?.[index]?.email?.message as unknown as string}</span>
                )}
          </div>
        </div>

        {/* Food Preference */}
        <div>
          <label className="block text-sm font-medium text-[#928dab] mb-3">Food Preference</label>
          <Controller
            name={isTeamLead ? 'teamLead.foodPreference' : `teamMembers.${index}.foodPreference`}
            control={control}
            rules={{ required: 'Food preference is required' }}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="veg" id={`food-veg-${index}`} />
                  <label htmlFor={`food-veg-${index}`} className="text-white cursor-pointer">Vegetarian</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-veg" id={`food-nonveg-${index}`} />
                  <label htmlFor={`food-nonveg-${index}`} className="text-white cursor-pointer">Non-Vegetarian</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id={`food-none-${index}`} />
                  <label htmlFor={`food-none-${index}`} className="text-white cursor-pointer">No Food Required</label>
                </div>
              </RadioGroup>
            )}
          />
        </div>
      </div>
    </div>
  ));

  MemberForm.displayName = 'MemberForm';

  return (
    <form onSubmit={handleSubmit(
      async (data) => {
        console.log('Form submitted, current step:', currentStep);
        // console.log('Form data:', data); // Removed for production security
        if (currentStep === 4) {
          console.log('Step 4: Initiating payment...');
          await handlePaymentInitiation(data);
        } else {
          console.log('Moving to next step...');
          setCurrentStep(currentStep + 1);
        }
      },
      (errors) => {
        console.error('Form validation failed:', errors);
        toast.error('Please check the form for errors.');
      }
    )} noValidate className="max-w-4xl mx-auto space-y-6 p-3 sm:space-y-8 sm:p-4">
      <fieldset disabled={isSubmitting} className="space-y-8">
      {/* Step 1: Team Details */}
      <div className={`space-y-6 ${currentStep !== 1 && 'hidden'}`}>
        <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
          <h3 className="font-orbitron text-xl text-[#928dab] mb-4">Team Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CustomInput
                {...register('teamName', { required: 'Team name is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                placeholder="Team Name"
                type="text"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors.teamName && (
                <p className="text-red-500 text-sm mt-1">{errors.teamName.message}</p>
              )}
            </div>
            
            <div>
              <CustomInput
                {...register('school', { required: 'School name is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                placeholder="School Name"
                type="text"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors.school && (
                <p className="text-red-500 text-sm mt-1">{errors.school.message}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <Controller
                name={'district'}
                control={control}
                rules={{ required: 'District is required' }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-black/50 border-[#7303c0] text-white w-full">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-[#7303c0] text-white">
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district.message}</p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={async () => {
            const ok = await trigger(['teamName', 'school', 'district']);
            if (!ok) {
              toast.error('Please complete Team Details.');
              return;
            }
            setCurrentStep(2);
          }}
          className="bg-[#7303c0] hover:bg-[#928dab] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Team Lead Details
        </Button>
      </div>

      {/* Step 2: Team Lead */}
      <div className={`space-y-6 ${currentStep !== 2 && 'hidden'}`}>
        <MemberForm isTeamLead={true} />
        
        {/* Teacher Verification Section */}
        <div className="space-y-4 p-4 sm:p-6 bg-black/30 backdrop-blur-sm border border-[#7303c0] clip-polygon">
          <h3 className="font-orbitron text-xl text-[#928dab] mb-4">
            Teacher Verification
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Controller
                name={'teacherVerification.salutation'}
                control={control}
                rules={{ required: 'Salutation is required' }}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sir" id="salutation-sir" />
                      <label htmlFor="salutation-sir">Sir</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maam" id="salutation-maam" />
                      <label htmlFor="salutation-maam">Ma&apos;am</label>
                    </div>
                  </RadioGroup>
                )}
              />
              {errors?.teacherVerification?.salutation && (
                <span className="text-red-500 text-sm">{errors.teacherVerification.salutation.message}</span>
              )}
            </div>

            <div>
              <CustomInput
                {...register('teacherVerification.name', { required: "Teacher's name is required" })}
                placeholder="Teacher's Name"
                type="text"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors?.teacherVerification?.name && (
                <span className="text-red-500 text-sm">{errors.teacherVerification.name.message}</span>
              )}
            </div>

            <div>
              <CustomInput
                {...register('teacherVerification.phone', { required: "Teacher's phone is required", pattern: { value: /^[0-9]{10}$/, message: 'Enter 10-digit phone' } })}
                placeholder="Teacher's Phone Number"
                type="tel"
                inputMode="numeric"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors?.teacherVerification?.phone && (
                <span className="text-red-500 text-sm">{errors.teacherVerification.phone.message}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
          <Button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="bg-[#928dab] hover:bg-[#7303c0] text-white w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={async () => {
              const okLead = await trigger([
                'teamLead.name', 'teamLead.gender', 'teamLead.grade', 'teamLead.phone', 'teamLead.email'
              ]);
              const okTeacher = await trigger([
                'teacherVerification.salutation', 'teacherVerification.name', 'teacherVerification.phone'
              ]);
              if (!okLead || !okTeacher) {
                toast.error('Please complete Team Lead and Teacher Verification.');
                return;
              }
              setCurrentStep(3);
            }}
            className="bg-[#7303c0] hover:bg-[#928dab] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Team Members
          </Button>
        </div>
      </div>

      {/* Step 3: Team Members */}
      <div className={`space-y-6 ${currentStep !== 3 && 'hidden'}`}>
        {fields.map((field, index) => (
          <div key={field.id} className="relative">
            <MemberForm index={index} />
            {fields.length > 1 && (
              <Button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        {fields.length < 3 && (
          <Button
            type="button"
            onClick={() => append({
              name: '',
              gender: 'male',
              grade: '11',
              phone: '',
              email: '',
              foodPreference: 'none'
            })}
            className="bg-[#928dab] hover:bg-[#7303c0] text-white w-full sm:w-auto"
          >
            Add Team Member
          </Button>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
          <Button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="bg-[#928dab] hover:bg-[#7303c0] text-white w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={async () => {
              // Validate all member fields dynamically
              const memberFields: string[] = [];
              fields.forEach((_, i) => {
                memberFields.push(
                  `teamMembers.${i}.name`,
                  `teamMembers.${i}.gender`,
                  `teamMembers.${i}.grade`,
                  `teamMembers.${i}.phone`,
                  `teamMembers.${i}.email`,
                  `teamMembers.${i}.foodPreference`,
                );
              });
              const ok = await trigger(memberFields as any);
              if (!ok) {
                toast.error('Please complete Team Members details.');
                return;
              }
              setCurrentStep(4);
            }}
            className="bg-[#7303c0] hover:bg-[#928dab] text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Project Details
          </Button>
        </div>
      </div>

      {/* Step 4: Project Details */}
      <div className={`space-y-6 ${currentStep !== 4 && 'hidden'}`}>
        <div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
          <h3 className="font-orbitron text-xl text-[#928dab] mb-4">Project Details</h3>
          
          <div className="space-y-4">
            <div>
              <CustomInput
                {...register('projectDetails.ideaTitle', { required: 'Idea title is required' })}
                placeholder="Idea Title (e.g., Smart Water Saver)"
                type="text"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors?.projectDetails?.ideaTitle && (
                <span className="text-red-500 text-sm">{errors.projectDetails.ideaTitle.message}</span>
              )}
            </div>

            <div>
              <textarea
                {...register('projectDetails.problemStatement', { required: 'Problem statement is required' })}
                placeholder="Problem you want to solve: Why is it important? Who faces it?"
                className="w-full h-28 bg-black/50 border border-[#7303c0] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#7303c0]"
              />
              {errors?.projectDetails?.problemStatement && (
                <span className="text-red-500 text-sm">{errors.projectDetails.problemStatement.message}</span>
              )}
            </div>

            <div>
              <textarea
                {...register('projectDetails.solutionIdea', { required: 'Solution idea is required' })}
                placeholder="Your solution / idea: How does it solve the problem? What makes it new?"
                className="w-full h-28 bg-black/50 border border-[#7303c0] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#7303c0]"
              />
              {errors?.projectDetails?.solutionIdea && (
                <span className="text-red-500 text-sm">{errors.projectDetails.solutionIdea.message}</span>
              )}
            </div>

            <div>
              <textarea
                {...register('projectDetails.implementationPlan', { required: 'Implementation plan is required' })}
                placeholder="How will it work? Explain in 4–5 sentences."
                className="w-full h-28 bg-black/50 border border-[#7303c0] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#7303c0]"
              />
              {errors?.projectDetails?.implementationPlan && (
                <span className="text-red-500 text-sm">{errors.projectDetails.implementationPlan.message}</span>
              )}
            </div>

            <div>
              <CustomInput
                {...register('projectDetails.beneficiaries', { required: 'Beneficiaries are required' })}
                placeholder="Who will benefit? (e.g., Students, farmers, parents)"
                type="text"
                className="bg-black/50 border-[#7303c0] text-white w-full"
              />
              {errors?.projectDetails?.beneficiaries && (
                <span className="text-red-500 text-sm">{errors.projectDetails.beneficiaries.message}</span>
              )}
            </div>

            <div>
              <textarea
                {...register('projectDetails.teamworkContribution', { required: 'Teamwork contribution is required' })}
                placeholder="Teamwork: 2–3 lines on what each teammate is doing"
                className="w-full h-24 bg-black/50 border border-[#7303c0] text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#7303c0]"
              />
              {errors?.projectDetails?.teamworkContribution && (
                <span className="text-red-500 text-sm">{errors.projectDetails.teamworkContribution.message}</span>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="mt-8">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  {...register('projectDetails.termsAccepted', { validate: (v) => v || 'You must accept the terms to continue' })}
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-[#7303c0] bg-black/50 checked:bg-[#7303c0]"
                />
                <label htmlFor="terms" className="text-sm text-[#928dab]">
                  I agree to the <TermsModal /> and acknowledge that:
                  <ul className="mt-2 ml-4 space-y-1 list-disc">
                    <li>I am a student of Class 11 or 12</li>
                    <li>The registration fee of ₹50 is non-refundable</li>
                    <li>Payment does not guarantee selection for the offline hackathon</li>
                    <li>I am responsible for informing my team members about these terms</li>
                  </ul>
                </label>
              </div>
              {errors?.projectDetails?.termsAccepted?.message && (
                <span className="text-red-500 text-sm block mt-1">
                  {errors.projectDetails.termsAccepted.message}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
          <Button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="bg-[#928dab] hover:bg-[#7303c0] text-white w-full sm:w-auto"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingRazorpay || !isRazorpayLoaded}
            className="bg-[#7303c0] hover:bg-[#928dab] text-white flex items-center justify-center space-x-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              // Ensure step 4 required fields are valid before submit
              const ok = await trigger([
                'projectDetails.ideaTitle',
                'projectDetails.problemStatement',
                'projectDetails.solutionIdea',
                'projectDetails.implementationPlan',
                'projectDetails.beneficiaries',
                'projectDetails.teamworkContribution',
                'projectDetails.termsAccepted',
              ]);
              if (!ok) {
                toast.error('Please complete Project Details and accept terms.');
              }
            }}
          >
            <span>
              {isLoadingRazorpay ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading Payment System...
                </div>
              ) : isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing Payment...
                </div>
              ) : !isRazorpayLoaded ? (
                'Payment System Not Ready'
              ) : (
                'Pay ₹50 & Register'
              )}
            </span>
          </Button>
        </div>
      </div>
      </fieldset>
          </form>
  );
}

