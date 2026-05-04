import type { ReactNode } from "react";
import type { ColorRow, ColorStop, Token } from "./data";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-2xl">
      <h2 className="mb-lg font-semibold text-20">{title}</h2>
      {children}
    </section>
  );
}

export function Swatch({ stop }: { stop: ColorStop }) {
  return (
    <div className="flex w-30 flex-col gap-md">
      <div
        className="h-16 rounded-md border border-neutral-500"
        style={{ backgroundColor: stop.hex }}
      />
      <div className="flex flex-col gap-xs">
        <code className="text-12 leading-120">--{stop.name}</code>
        <span className="text-12 text-neutral-800 leading-120">
          {stop.sub ?? stop.hex.replace("#", "")}
        </span>
      </div>
    </div>
  );
}

export function ColorRowBlock({ row }: { row: ColorRow }) {
  return (
    <div className="mb-lg">
      <h3 className="mb-md font-medium text-14">{row.label}</h3>
      <div className="flex flex-wrap gap-lg">
        {row.stops.map((stop) => (
          <Swatch key={stop.name} stop={stop} />
        ))}
      </div>
    </div>
  );
}

export function ComponentBlock({
  label,
  description,
  children,
  bare = false,
}: {
  label: string;
  description?: string;
  children: ReactNode;
  bare?: boolean;
}) {
  return (
    <div className="mb-2xl">
      <div className="mb-md">
        <h3 className="font-medium text-14 text-foreground">{label}</h3>
        {description ? (
          <p className="mt-xs text-12 text-foreground-subtle">{description}</p>
        ) : null}
      </div>
      {bare ? (
        children
      ) : (
        <div className="rounded-lg border border-border bg-surface p-lg">
          {children}
        </div>
      )}
    </div>
  );
}

export function VariantCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-md">
      <div className="flex min-h-10 items-center">{children}</div>
      <span className="text-12 text-foreground-subtle">{label}</span>
    </div>
  );
}

export function TokenTable({
  label,
  rows,
  utilityHint,
}: {
  label: string;
  rows: Token[];
  utilityHint?: string;
}) {
  return (
    <div className="mb-2xl">
      <div className="mb-md flex items-baseline gap-md">
        <h3 className="font-medium text-16 text-foreground">{label}</h3>
        {utilityHint ? (
          <span className="text-12 text-foreground-subtle">{utilityHint}</span>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-lg border-border border-b bg-background px-lg py-base font-medium text-12 text-foreground-subtle">
          <div className="w-64 shrink-0">Name</div>
          <div className="w-80 shrink-0">Alias</div>
          <div className="min-w-0 flex-1">Usage</div>
        </div>
        {rows.map((row) => (
          <div
            className="flex items-center gap-lg border-border border-b bg-surface px-lg py-lg last:border-b-0"
            key={row.name}
          >
            <code className="w-64 shrink-0 text-13 text-foreground">
              --{row.name}
            </code>
            <div className="flex w-80 shrink-0 items-center gap-md">
              <div
                className="h-5 w-5 shrink-0 rounded-full border border-border"
                style={{ backgroundColor: row.swatchVar }}
              />
              <span className="text-13 text-foreground">{row.alias}</span>
            </div>
            <div className="min-w-0 flex-1 text-13 text-foreground-muted">
              {row.usage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type PrimitiveRow = {
  name: string;
  preview: ReactNode;
  usage: ReactNode;
};

export function PrimitiveTable({
  label,
  rows,
  valueLabel = "Value",
  nameWidth = "w-56",
  valueWidth = "w-80",
}: {
  label?: string;
  rows: PrimitiveRow[];
  valueLabel?: string;
  nameWidth?: string;
  valueWidth?: string;
}) {
  return (
    <div className="mb-2xl">
      {label ? (
        <h3 className="mb-md font-medium text-16 text-foreground">{label}</h3>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-lg border-border border-b bg-background px-lg py-base font-medium text-12 text-foreground-subtle">
          <div className={`${nameWidth} shrink-0`}>Name</div>
          <div className={`${valueWidth} shrink-0`}>{valueLabel}</div>
          <div className="min-w-0 flex-1">Usage</div>
        </div>
        {rows.map((row) => (
          <div
            className="flex items-center gap-lg border-border border-b bg-surface px-lg py-lg last:border-b-0"
            key={row.name}
          >
            <code className={`${nameWidth} shrink-0 text-13 text-foreground`}>
              --{row.name}
            </code>
            <div className={`${valueWidth} shrink-0`}>{row.preview}</div>
            <div className="min-w-0 flex-1 text-13 text-foreground-muted">
              {row.usage}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-2xl">
      <h1 className="font-semibold text-20">{title}</h1>
      {description ? (
        <p className="mt-xs text-14 text-foreground-subtle">{description}</p>
      ) : null}
    </header>
  );
}
