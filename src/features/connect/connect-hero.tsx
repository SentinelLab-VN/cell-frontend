/** Left column of the landing screen: the pitch. */
export function ConnectHero() {
  return (
    <section>
      <p className="num text-sm tracking-[0.25em] text-primary-ink uppercase md:text-base">Cell</p>
      <h1 className="mt-5 max-w-2xl text-[36px] leading-[1.08] font-semibold tracking-[-0.03em] text-foreground md:text-[50px] lg:text-[64px]">
        Instant transfers, backed on Stellar.
      </h1>
      <p className="mt-6 max-w-[540px] text-base leading-[1.65] text-muted-foreground">
        Balances live in an escrow anyone can audit. Payments inside the channel are instant and private.
      </p>
    </section>
  );
}
