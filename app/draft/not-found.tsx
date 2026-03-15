import { ButtonLink, Panel } from "@/app/draft/components/primitives";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
      <Panel className="w-full text-center">
        <div className="text-xs tracking-[0.24em] text-[color:var(--gold-soft)] uppercase">
          Route not found
        </div>
        <h1 className="mt-4 font-heading text-5xl text-white">Constellation lost</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-[color:var(--text-soft)]">
          The requested screen is not part of the current Constantlation route
          map. Return to the curated registry or the flagship vault.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/vaults" tone="primary">
            Open Vault Registry
          </ButtonLink>
          <ButtonLink href="/" tone="secondary">
            Return Home
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}

