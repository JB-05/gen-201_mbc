'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function TermsModal() {
  return (
    <Dialog>
      <DialogTrigger className="text-[#7303c0] hover:text-[#928dab] underline">
        terms and conditions
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-black/95 border border-[#7303c0] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-[#7303c0] mb-6">Terms & Conditions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-[#928dab]">
          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Eligibility</h3>
            <p>Participation in Gen 201 is strictly limited to students of Class 11 and Class 12 only.</p>
            <p className="mt-2 text-sm">Any submissions made by ineligible participants will not be entertained, and the payment will remain non-refundable.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Purpose of Payment</h3>
            <p>The fee of ₹50 (plus applicable Razorpay commission/extra charges) is solely collected for the purpose of administrative processing and idea submission.</p>
            <p className="mt-2 text-sm">This payment does not guarantee selection into the offline hackathon round, nor does it provide any priority or preference in evaluation.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Non-Refundable Policy</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Under normal circumstances, all payments are strictly non-refundable.</li>
              <li>This applies even in cases of idea rejection, withdrawal of participation, or failure to attend further rounds.</li>
              <li>In exceptional circumstances such as political, economic, or environmental causes, the refund decision (if any) shall be made solely by the Gen 201 Organizing Team. Their decision will be final and binding.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Payment Gateway Disclaimer</h3>
            <p>All payments are processed securely through Razorpay.</p>
            <p className="mt-2 text-sm">The Organizing Committee, Department of AI, Mar Baselios Christian College of Engineering and Technology, Kuttikanam, and the Gen 201 Team shall not be responsible for technical issues, transaction failures, delays, or duplicate payments caused by the Razorpay platform or the participant&apos;s banking/payment provider.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">No Guarantee of Participation</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Submission of the idea fee does not assure a confirmed spot in the offline hackathon.</li>
              <li>The selection of participants will be based solely on the evaluation of submitted ideas and the decision of the organizing team.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Finality of Decisions</h3>
            <p>All decisions made by the Head Coordinators and Organizing Team of Gen 201 regarding selection, refunds (if any), or event-related disputes shall be final, unbiased, and binding on all participants.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-[#7303c0] mb-2">Acknowledgement & Team Responsibility</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>By proceeding with the payment, the participant (and their team) acknowledges that they have read, understood, and agreed to these Terms & Conditions.</li>
              <li>The responsibility lies with the registering individual to inform all team members of these conditions.</li>
              <li>Claims of being unaware of the Terms & Conditions will not be accepted under any circumstances.</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
