-- Convert payments.amount from paise to rupees for existing data
-- Only convert rows that still look like paise (amount >= 100 and divisible by 100)
UPDATE payments
SET amount = amount / 100
WHERE amount IS NOT NULL AND amount >= 100 AND amount % 100 = 0;

-- Optional: add a CHECK to discourage paise going forward (can be relaxed if needed)
ALTER TABLE payments
    ADD CONSTRAINT payments_amount_rupees_positive CHECK (amount > 0);

