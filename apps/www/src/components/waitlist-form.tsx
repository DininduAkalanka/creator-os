"use client";

import Link from "next/link";
import { useActionState, useId, type ReactNode } from "react";
import { joinWaitlist } from "@/app/actions";
import {
  editingHoursLabels,
  errorMessages,
  languageLabels,
  roleLabels,
  videosPerMonthLabels,
  waitlistCopy as copy,
} from "@/content/waitlist";
import {
  CHANNEL_MAX_LENGTH,
  EDITING_HOURS,
  EMAIL_MAX_LENGTH,
  LANGUAGES,
  ROLES,
  VIDEOS_PER_MONTH,
  type WaitlistField,
  type WaitlistFieldErrors,
  type WaitlistFormState,
  type WaitlistFormValues,
} from "@/lib/waitlist";
import { buttonPrimary } from "./styles";

const initialState: WaitlistFormState = { status: "idle" };

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted/70 aria-[invalid=true]:border-danger";

interface AriaErrorProps {
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);
  const baseId = useId();

  const values: WaitlistFormValues = state.status === "idle" ? {} : state.values;
  const errors: WaitlistFieldErrors = state.status === "invalid" ? state.errors : {};
  const ids = (field: WaitlistField) => ({
    input: `${baseId}-${field}`,
    error: `${baseId}-${field}-error`,
  });
  // Props that wire a field to its error message for screen readers.
  const errorProps = (field: WaitlistField, hintId?: string): AriaErrorProps => {
    const describedBy = [hintId, errors[field] ? ids(field).error : undefined].filter(Boolean);
    return {
      ...(errors[field] ? { "aria-invalid": true } : {}),
      ...(describedBy.length > 0 ? { "aria-describedby": describedBy.join(" ") } : {}),
    };
  };

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.status === "invalid" && (
        <p role="alert" className="rounded-lg border border-danger px-4 py-3 text-sm text-danger">
          {copy.errorSummary}
        </p>
      )}

      <div>
        <label htmlFor={ids("email").input} className="text-sm font-semibold">
          {copy.emailLabel}
        </label>
        <input
          id={ids("email").input}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={EMAIL_MAX_LENGTH}
          placeholder={copy.emailPlaceholder}
          defaultValue={values.email}
          className={inputClass}
          {...errorProps("email")}
        />
        <FieldError id={ids("email").error} code={errors.email} />
      </div>

      <fieldset className="rounded-xl border border-line p-4 sm:p-5">
        <legend className="px-1 text-sm text-muted">{copy.optionalLegend}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id={ids("role").input}
            errorId={ids("role").error}
            name="role"
            label={copy.roleLabel}
            placeholder={copy.notAnswered}
            options={ROLES.map((value) => [value, roleLabels[value]])}
            defaultValue={values.role}
            error={errors.role}
            extraProps={errorProps("role")}
          />

          <div>
            <label htmlFor={ids("channel").input} className="text-sm font-semibold">
              {copy.channelLabel}
            </label>
            <input
              id={ids("channel").input}
              name="channel"
              type="text"
              inputMode="url"
              autoComplete="url"
              maxLength={CHANNEL_MAX_LENGTH}
              placeholder="@yourchannel"
              defaultValue={values.channel}
              className={inputClass}
              {...errorProps("channel", `${ids("channel").input}-hint`)}
            />
            <p id={`${ids("channel").input}-hint`} className="mt-1 text-xs text-muted">
              {copy.channelHint}
            </p>
            <FieldError id={ids("channel").error} code={errors.channel} />
          </div>

          <SelectField
            id={ids("videosPerMonth").input}
            errorId={ids("videosPerMonth").error}
            name="videosPerMonth"
            label={copy.videosLabel}
            placeholder={copy.notAnswered}
            options={VIDEOS_PER_MONTH.map((value) => [value, videosPerMonthLabels[value]])}
            defaultValue={values.videosPerMonth}
            error={errors.videosPerMonth}
            extraProps={errorProps("videosPerMonth")}
          />

          <SelectField
            id={ids("editingHours").input}
            errorId={ids("editingHours").error}
            name="editingHours"
            label={copy.hoursLabel}
            placeholder={copy.notAnswered}
            options={EDITING_HOURS.map((value) => [value, editingHoursLabels[value]])}
            defaultValue={values.editingHours}
            error={errors.editingHours}
            extraProps={errorProps("editingHours")}
          />

          <SelectField
            id={ids("language").input}
            errorId={ids("language").error}
            name="language"
            label={copy.languageLabel}
            placeholder={copy.notAnswered}
            options={LANGUAGES.map((value) => [value, languageLabels[value]])}
            defaultValue={values.language}
            error={errors.language}
            extraProps={errorProps("language")}
          />
        </div>
      </fieldset>

      <div>
        <div className="flex items-start gap-3">
          <input
            id={ids("consent").input}
            name="consent"
            type="checkbox"
            required
            defaultChecked={values.consent === "on"}
            className="mt-1 size-4 shrink-0 accent-accent"
            {...errorProps("consent")}
          />
          <label htmlFor={ids("consent").input} className="text-sm text-muted">
            {copy.consentBefore}
            <Link href="/privacy" className="text-accent underline underline-offset-2">
              {copy.consentLink}
            </Link>
            {copy.consentAfter}
          </label>
        </div>
        <FieldError id={ids("consent").error} code={errors.consent} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className={`${buttonPrimary} px-6 py-3 text-base`}>
          {pending ? copy.submitting : copy.submit}
        </button>
        <p role="status" className="text-sm text-ink">
          {state.status === "not_open" ? copy.notOpen : ""}
        </p>
      </div>
    </form>
  );
}

function FieldError({ id, code }: { id: string; code: WaitlistFieldErrors[WaitlistField] }) {
  if (!code) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-danger">
      {errorMessages[code]}
    </p>
  );
}

function SelectField(props: {
  id: string;
  errorId: string;
  name: WaitlistField;
  label: ReactNode;
  placeholder: string;
  options: Array<[value: string, label: string]>;
  defaultValue: string | undefined;
  error: WaitlistFieldErrors[WaitlistField];
  extraProps: AriaErrorProps;
}) {
  return (
    <div>
      <label htmlFor={props.id} className="text-sm font-semibold">
        {props.label}
      </label>
      <select
        id={props.id}
        name={props.name}
        defaultValue={props.defaultValue ?? ""}
        className={inputClass}
        {...props.extraProps}
      >
        <option value="">{props.placeholder}</option>
        {props.options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <FieldError id={props.errorId} code={props.error} />
    </div>
  );
}
