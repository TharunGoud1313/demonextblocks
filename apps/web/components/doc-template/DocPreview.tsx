import React, { useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { renderFormField } from "./render-doc-field";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import If from "@/components/ui/if";
import { FormFieldType } from "@/types";

import {
  generateZodSchema,
  generateDefaultValues,
} from "./generate-code-parts";
import { formatJSXCode } from "@/lib/utils";

export type FormFieldOrGroup = FormFieldType | FormFieldType[];

export type FormPreviewProps = {
  formFields: FormFieldOrGroup[];
  apiFieldData?: any;
};

const renderFormFields = (
  fields: FormFieldOrGroup[],
  form: any,
  apiFieldData?: any
) => {
  // Filter out completely disabled fields
  const activeFields = fields.filter((fieldOrGroup) =>
    Array.isArray(fieldOrGroup)
      ? fieldOrGroup.some((field) => !field.disabled)
      : !fieldOrGroup.disabled
  );

  return activeFields.map((fieldOrGroup, index) => {
    if (Array.isArray(fieldOrGroup)) {
      // Filter out disabled fields within the group
      const activeGroupFields = fieldOrGroup.filter((field) => !field.disabled);

      // Calculate column span based on number of active fields in the group
      const getColSpan = (totalFields: number) => {
        switch (totalFields) {
          case 2:
            return 6; // Two columns
          case 3:
            return 4; // Three columns
          default:
            return 12; // Single column or fallback
        }
      };

      return (
        <div key={index} className="grid grid-cols-12 gap-4">
          {activeGroupFields.map((field, subIndex) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => {
                // Clone the field and conditionally apply disabled prop
                const formFieldElement = React.cloneElement(
                  renderFormField(
                    field,
                    form,
                    apiFieldData
                  ) as React.ReactElement,
                  {
                    ...formField,
                    disabled: field.disabled || formField.disabled,
                  }
                );

                return (
                  <FormItem
                    className={`col-span-${getColSpan(
                      activeGroupFields.length
                    )}`}
                  >
                    <FormControl>{formFieldElement}</FormControl>
                  </FormItem>
                );
              }}
            />
          ))}
        </div>
      );
    } else {
      return (
        <FormField
          key={fieldOrGroup.name}
          control={form.control}
          name={fieldOrGroup.name}
          render={({ field: formField }) => {
            // Clone the field and conditionally apply disabled prop
            const formFieldElement = React.cloneElement(
              renderFormField(
                fieldOrGroup,
                form,
                apiFieldData
              ) as React.ReactElement,
              {
                ...formField,
                disabled: fieldOrGroup.disabled || formField.disabled,
              }
            );

            return (
              <FormItem className="col-span-12">
                <FormControl>{formFieldElement}</FormControl>
              </FormItem>
            );
          }}
        />
      );
    }
  });
};

export const FormPreview: React.FC<FormPreviewProps> = ({
  formFields,
  apiFieldData,
}) => {
  // Filter out all disabled fields when generating schema and default values
  const activeFormFields = formFields.flatMap((field) =>
    Array.isArray(field)
      ? field.filter((f) => !f.disabled)
      : !field.disabled
      ? field
      : []
  );

  const formSchema = generateZodSchema(activeFormFields);
  const defaultVals = generateDefaultValues(activeFormFields);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultVals,
  });

  return (
    <div className="w-full h-full rounded-xl flex justify-center">
      <If
        condition={activeFormFields.length > 0}
        render={() => (
          <Form {...form}>
            <form className="space-y-4 py-5 w-full md:w-[90%] mx-auto">
              {renderFormFields(formFields, form, apiFieldData)}
            </form>
          </Form>
        )}
        otherwise={() => (
          <div className="h-[50vh] flex justify-center items-center">
            <p>No form element selected yet.</p>
          </div>
        )}
      />
    </div>
  );
};

export default FormPreview;
