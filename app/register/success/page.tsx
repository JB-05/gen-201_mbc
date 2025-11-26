"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

interface SuccessPayload {
	team: {
		team_name: string;
		school_name: string;
		school_district: string;
		lead_phone: string;
		lead_email: string;
	};
	members: Array<{
		name: string;
		gender: string;
		grade: string;
		phone: string;
		email: string;
		food_preference?: string;
		is_team_lead?: boolean;
	}>;
	project: {
		idea_title: string;
		problem_statement: string;
		solution_idea: string;
		implementation_plan: string;
		beneficiaries: string;
		teamwork_contribution: string;
	};
	teacher: {
		salutation: string;
		teacher_name: string;
		teacher_phone: string;
	};
	payment: {
		paymentId: string;
		orderId: string;
		// signature intentionally not stored/displayed
	};
	meta?: {
		teamId?: string;
		teamCode?: string;
		createdAt?: string;
	};
}

export default function RegistrationSuccessPage() {
	const [data, setData] = useState<SuccessPayload | null>(null);
	const printRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		try {
			const raw = sessionStorage.getItem("gen201_registration_success");
			if (raw) {
				setData(JSON.parse(raw));
			}
		} catch (err) {
			console.error("Failed to load success data", err);
		}
	}, []);

	const termsText = useMemo(() => (
		`Terms & Conditions (Summary)\n\n` +
		`- Participation limited to Class 11 and 12 students.\n` +
		`- Fee is non-refundable (except extraordinary situations decided by organizers).\n` +
		`- Payment does not guarantee selection to offline hackathon.\n` +
		`- Payments are processed by Razorpay; technical issues are not the organizer's liability.\n` +
		`- Organizer decisions regarding selection/refunds are final.\n` +
		`- The registering individual is responsible for informing all team members of these terms.`
	), []);

	const handleDownloadPdf = async () => {
		if (!data) return;
		
		// Debug: Log the data structure to identify issues
		console.log('PDF Generation - Full data:', data);
		console.log('PDF Generation - Teacher data:', data.teacher);
		console.log('PDF Generation - Project data:', data.project);
		
		try {
			const pdf = new jsPDF("p", "mm", "a4");
			const pageWidth = pdf.internal.pageSize.getWidth();

			// Helper function to add text with word wrapping
			const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
				pdf.setFontSize(fontSize);
				const split = pdf.splitTextToSize(text, maxWidth);
				pdf.text(split as string[], x, y);
				return y + (Array.isArray(split) ? split.length : 1) * (fontSize * 0.4);
			};

			// Helper function to add a row
			const row = (label: string, value: string, y: number) => {
				pdf.setFontSize(10);
				pdf.setTextColor(100, 100, 100); // Dark gray for labels
				pdf.text(label, 10, y);
				pdf.setTextColor(0, 0, 0); // Black for values
				const valueY = addText(value, 60, y, pageWidth - 70, 10);
				return Math.max(y + 6, valueY);
			};

			// Header
			pdf.setFontSize(18);
			pdf.setTextColor(115, 3, 192); // Purple color for title
			pdf.text("GEN 201 - Registration Receipt", 10, 15);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, 18, pageWidth - 10, 18);

			// Registration details
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Registration Details", 10, 28);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, 31, pageWidth - 10, 31);

			let y = 38;
			y = row("Payment ID", data.payment.paymentId, y);
			y = row("Team Code", data.meta?.teamCode || "N/A", y);
			y = row("Team Name", data.team.team_name, y);
			y = row("School", data.team.school_name, y);
			y = row("District", data.team.school_district, y);
			y = row("Date", new Date(data.meta?.createdAt || Date.now()).toLocaleString(), y);

			// Team Lead Details
			y += 10;
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Team Lead Details", 10, y);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, y + 3, pageWidth - 10, y + 3);
			y += 10;

			const teamLead = data.members.find(m => m.is_team_lead);
			if (teamLead) {
				y = row("Name", teamLead.name, y);
				y = row("Phone", teamLead.phone, y);
				y = row("Email", teamLead.email, y);
				y = row("Grade", `Grade ${teamLead.grade}`, y);
				y = row("Gender", teamLead.gender, y);
				if (teamLead.food_preference) {
					y = row("Food Preference", teamLead.food_preference, y);
				}
			}

			// Team Members Details
			y += 10;
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Team Members", 10, y);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, y + 3, pageWidth - 10, y + 3);
			y += 10;

			const teamMembers = data.members.filter(m => !m.is_team_lead);
			teamMembers.forEach((member, index) => {
				pdf.setFontSize(10);
				pdf.setTextColor(115, 3, 192);
				pdf.text(`Member ${index + 1}:`, 10, y);
				y += 6;
				y = row("Name", member.name, y);
				y = row("Phone", member.phone, y);
				y = row("Email", member.email, y);
				y = row("Grade", `Grade ${member.grade}`, y);
				y = row("Gender", member.gender, y);
				if (member.food_preference) {
					y = row("Food Preference", member.food_preference, y);
				}
				y += 5;
			});

			// Project Details
			y += 10;
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Project Details", 10, y);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, y + 3, pageWidth - 10, y + 3);
			y += 10;

			// Ensure project data exists and provide fallbacks
			const ideaTitle = data.project?.idea_title || 'N/A';
			const problemStatement = data.project?.problem_statement || 'N/A';
			const solutionIdea = data.project?.solution_idea || 'N/A';
			const implementationPlan = data.project?.implementation_plan || 'N/A';
			const beneficiaries = data.project?.beneficiaries || 'N/A';
			const teamworkContribution = data.project?.teamwork_contribution || 'N/A';

			y = row("Idea Title", ideaTitle, y);
			y += 5;
			
			pdf.setFontSize(10);
			pdf.setTextColor(100, 100, 100);
			pdf.text("Problem Statement:", 10, y);
			y = addText(problemStatement, 10, y + 5, pageWidth - 20, 9);
			y += 5;

			pdf.setTextColor(100, 100, 100);
			pdf.text("Solution Idea:", 10, y);
			y = addText(solutionIdea, 10, y + 5, pageWidth - 20, 9);
			y += 5;

			pdf.setTextColor(100, 100, 100);
			pdf.text("Implementation Plan:", 10, y);
			y = addText(implementationPlan, 10, y + 5, pageWidth - 20, 9);
			y += 5;

			y = row("Beneficiaries", beneficiaries, y);
			y += 5;

			pdf.setTextColor(100, 100, 100);
			pdf.text("Teamwork Contribution:", 10, y);
			y = addText(teamworkContribution, 10, y + 5, pageWidth - 20, 9);

			// Teacher Verification
			y += 10;
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Teacher Verification", 10, y);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, y + 3, pageWidth - 10, y + 3);
			y += 10;

			// Ensure teacher data exists and provide fallbacks
			const teacherSalutation = data.teacher?.salutation || 'N/A';
			const teacherName = data.teacher?.teacher_name || 'N/A';
			const teacherPhone = data.teacher?.teacher_phone || 'N/A';

			y = row("Salutation", teacherSalutation, y);
			y = row("Name", teacherName, y);
			y = row("Phone", teacherPhone, y);

			// Terms page
			pdf.addPage();
			pdf.setFontSize(14);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Agreed Terms & Conditions", 10, 15);
			pdf.setFontSize(10);
			pdf.setTextColor(0, 0, 0);
			const split = pdf.splitTextToSize(termsText, pageWidth - 20);
			pdf.text(split as string[], 10, 25);

			// Contact Information
			let contactY = 25 + (Array.isArray(split) ? split.length : 1) * 4 + 20;
			pdf.setFontSize(12);
			pdf.setTextColor(115, 3, 192);
			pdf.text("Contact Information", 10, contactY);
			pdf.setDrawColor(115, 3, 192);
			pdf.line(10, contactY + 3, pageWidth - 10, contactY + 3);
			contactY += 10;

			pdf.setFontSize(10);
			pdf.setTextColor(0, 0, 0);
			pdf.text("Noel Biju:", 10, contactY);
			pdf.text("+91 88482 58798", 60, contactY);
			contactY += 8;
			pdf.text("Selma Anna Saju:", 10, contactY);
			pdf.text("+91 88482 44807", 60, contactY);
			
			pdf.save("GEN201_Registration.pdf");
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Failed to generate PDF. Please try again.');
		}
	};

	if (!data) {
		return (
			<div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
				<div className="text-center">
					<p className="text-[#928dab]">Loading registration details...</p>
					<Link href="/" className="inline-block mt-4 bg-[#7303c0] text-white px-6 py-2 clip-polygon hover:bg-[#928dab]">
						Go to Home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white p-4 sm:p-6">
			<div className="max-w-4xl mx-auto space-y-6">
				<h1 className="text-2xl sm:text-3xl font-orbitron text-[#7303c0]">Registration Successful</h1>
				<p className="text-[#928dab]">Your payment and registration are complete. Save or export the details below for your records.</p>

				<div ref={printRef} className="space-y-6">
					{/* Payment Info */}
					<div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
						<h2 className="font-orbitron text-xl text-[#928dab] mb-4">Payment Information</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
							<div><span className="text-[#928dab]">Payment ID:</span> {data.payment.paymentId}</div>
							{/* Order ID and Team ID intentionally hidden */}
							{(data.meta?.teamCode) && (
								<div><span className="text-[#928dab]">Team Code:</span> {data.meta.teamCode}</div>
							)}
							{data.meta?.createdAt && (
								<div><span className="text-[#928dab]">Date:</span> {new Date(data.meta.createdAt).toLocaleString()}</div>
							)}
						</div>
					</div>

					{/* Team Info */}
					<div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
						<h2 className="font-orbitron text-xl text-[#928dab] mb-4">Team Information</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
							<div><span className="text-[#928dab]">Team Name:</span> {data.team.team_name}</div>
							<div><span className="text-[#928dab]">School:</span> {data.team.school_name}</div>
							<div><span className="text-[#928dab]">District:</span> {data.team.school_district}</div>
							<div><span className="text-[#928dab]">Lead Phone:</span> {data.team.lead_phone}</div>
							<div><span className="text-[#928dab]">Lead Email:</span> {data.team.lead_email}</div>
						</div>
					</div>

					{/* Members */}
					<div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
						<h2 className="font-orbitron text-xl text-[#928dab] mb-4">Team Members</h2>
						<div className="space-y-3 text-sm">
							{data.members.map((m, idx) => (
								<div key={idx} className="border border-[#7303c0]/40 p-3">
									<div className="font-semibold text-white">{m.name} {m.is_team_lead ? '(Lead)' : ''}</div>
									<div className="text-[#928dab]">Grade {m.grade} • {m.gender}</div>
									<div>Phone: {m.phone}</div>
									<div>Email: {m.email}</div>
									{m.food_preference && <div>Food: {m.food_preference}</div>}
								</div>
							))}
						</div>
					</div>

					{/* Project */}
					<div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
						<h2 className="font-orbitron text-xl text-[#928dab] mb-4">Project Details</h2>
						<div className="space-y-2 text-sm">
							<div><span className="text-[#928dab]">Idea Title:</span> {data.project.idea_title}</div>
							<div>
								<span className="text-[#928dab]">Problem Statement:</span>
								<p className="whitespace-pre-wrap">{data.project.problem_statement}</p>
							</div>
							<div>
								<span className="text-[#928dab]">Solution Idea:</span>
								<p className="whitespace-pre-wrap">{data.project.solution_idea}</p>
							</div>
							<div>
								<span className="text-[#928dab]">Implementation Plan:</span>
								<p className="whitespace-pre-wrap">{data.project.implementation_plan}</p>
							</div>
							<div><span className="text-[#928dab]">Beneficiaries:</span> {data.project.beneficiaries}</div>
							<div><span className="text-[#928dab]">Teamwork Contribution:</span> <span className="whitespace-pre-wrap">{data.project.teamwork_contribution}</span></div>
						</div>
					</div>

					{/* Teacher */}
					<div className="bg-black/30 backdrop-blur-sm border border-[#7303c0] p-4 sm:p-6 clip-polygon">
						<h2 className="font-orbitron text-xl text-[#928dab] mb-4">Teacher Verification</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
							<div><span className="text-[#928dab]">Salutation:</span> {data.teacher.salutation}</div>
							<div><span className="text-[#928dab]">Name:</span> {data.teacher.teacher_name}</div>
							<div><span className="text-[#928dab]">Phone:</span> {data.teacher.teacher_phone}</div>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
					<button onClick={handleDownloadPdf} className="bg-[#7303c0] hover:bg-[#928dab] text-white px-6 py-2 clip-polygon">Download PDF</button>
					<Link href="/" className="bg-[#928dab] hover:bg-[#7303c0] text-white px-6 py-2 clip-polygon text-center">Go to Home</Link>
				</div>
			</div>
		</div>
	);
}
