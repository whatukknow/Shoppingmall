'use client';

import { useId } from 'react';
import { cn } from '@/shared/utils/cn';
import { Input } from './ui/input';

type CommonProps = {
  label: string;
  id?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

type InputFieldProps = CommonProps &
  Omit<React.ComponentProps<'input'>, 'id' | 'required' | 'className'> & {
    as?: 'input';
  };

type SelectFieldProps = CommonProps &
  Omit<React.ComponentProps<'select'>, 'id' | 'required' | 'className'> & {
    as: 'select';
  };

const fieldMetaKeys = ['as', 'label', 'id', 'description', 'error', 'required', 'className'] as const;

function getControlProps(props: FormFieldProps) {
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !fieldMetaKeys.includes(key as (typeof fieldMetaKeys)[number])),
  );
}

export type FormFieldProps = InputFieldProps | SelectFieldProps;

export function FormField(props: FormFieldProps) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const { label, description, error, required = false, className } = props;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy = [description ? descriptionId : undefined, error ? errorId : undefined]
    .filter(Boolean)
    .join(' ') || undefined;
  const fieldAccessibilityProps = {
    id,
    required,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };
  const labelNode = (
    <label htmlFor={id} className="text-sm font-medium">
      {label}{required && <span aria-hidden="true" className="text-destructive"> *</span>}
    </label>
  );
  const feedback = (
    <>
      {description && <p id={descriptionId} className="text-muted-foreground text-sm">{description}</p>}
      {error && <p id={errorId} role="alert" className="text-destructive text-sm">{error}</p>}
    </>
  );

  if (props.as === 'select') {
    return (
      <div className={cn('flex min-w-0 flex-col gap-2', className)}>
        {labelNode}
        <select
          {...getControlProps(props)}
          {...fieldAccessibilityProps}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-muted min-h-12 w-full rounded-lg border bg-transparent px-3 py-2 text-base outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {feedback}
      </div>
    );
  }
  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      {labelNode}
      <Input {...getControlProps(props)} {...fieldAccessibilityProps} className="min-h-12" />
      {feedback}
    </div>
  );
}
