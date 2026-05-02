import { PurchaseGate } from "@/components/PurchaseGate";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-5 py-12 md:px-8">
      <PurchaseGate sessionId={sessionId} />
    </main>
  );
}
