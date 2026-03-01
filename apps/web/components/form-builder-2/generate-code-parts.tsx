import { z, ZodTypeAny } from "zod";
import { FormFieldType } from "@/types";

type FormFieldOrGroup = FormFieldType | FormFieldType[];

export const generateZodSchema = (
  formFields: FormFieldOrGroup[]
): z.ZodObject<any> => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  const processField = (field: FormFieldType): void => {
    if (field.variant === "Label") return;

    if (field.variant === "Send Image") return;
    if (field.variant === "Send Video") return;
    if (field.variant === "Send File") return;
    if (field.variant === "Send Pdf") return;
    if (field.variant === "Send Media Card") return;
    if (field.variant === "Analytic Card") return;

    let fieldSchema: z.ZodTypeAny;

    switch (field.variant) {
      case "Text Box":
        if (field.type === "email") {
          fieldSchema = z.string().email();
          break;
        } else if (field.type === "number") {
          fieldSchema = z.coerce.number();
          break;
        } else {
          fieldSchema = z.string();
        }
        if (field.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(1, {
            message: `${field.label} is required`,
          });
        }
        break;
      case "Check Box":
        fieldSchema = z.boolean().default(true);
        break;
      case "Check box label":
        fieldSchema = z.boolean();
        if (field.required) {
          fieldSchema = fieldSchema.refine((val) => val === true, {
            message: `${field.label} must be checked`,
          });
        }

        break;
      case "Radio Box":
        fieldSchema = z.boolean().default(true);

        break;
      case "Search Lookup":
      case "Image":
      case "Select":
      case "Date":
        fieldSchema = z.coerce.date();
        break;
      case "Time":
        fieldSchema = z
          .string()
          .refine((time) => /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/.test(time), {
            message: "Invalid time format. Expected format is HH:mm AM/PM.",
          });
        break;

      case "From Date to To Date":
        fieldSchema = z
          .object({
            fromDate: z.coerce.date(),
            toDate: z.coerce.date(),
          })
          .refine((data) => data.toDate > data.fromDate, {
            message: "'To Date' must be later than 'From Date'",
            path: ["toDate"],
          });
        break;
      // case "From Time to To Time":
      //   fieldSchema = z.object({
      //     fromTime: z.string().refine(
      //       (time) => /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/.test(time),
      //       { message: "Invalid 'From Time' format. Expected format is HH:mm AM/PM." }
      //     ),
      //     toTime: z.string().refine(
      //       (time) => /^(0?[1-9]|1[0-2]):([0-5]\d) (AM|PM)$/.test(time),
      //       { message: "Invalid 'To Time' format. Expected format is HH:mm AM/PM." }
      //     ),
      //   }).refine(
      //     (data) => {
      //       const parseTime = (time: string) => {
      //         const [hour, minute, period] = time.match(/(\d+):(\d+) (AM|PM)/)!.slice(1);
      //         const hours24 = period === "PM" && hour !== "12" ? parseInt(hour) + 12 : parseInt(hour) % 12;
      //         return hours24 * 60 + parseInt(minute); // Total minutes
      //       };
      //       const fromTimeMinutes = parseTime(data.fromTime);
      //       const toTimeMinutes = parseTime(data.toTime);
      //       return toTimeMinutes > fromTimeMinutes;
      //     },
      //     { message: "'To Time' must be later than 'From Time'.", path: ["toTime"] }
      //   );
      //   break;

      // case 'Date Time':
      //   fieldSchema = z.coerce.date()
      //   break
      case "Tab Seperator":

      case "Location Select":
        fieldSchema = z.tuple([
          z.string({
            required_error: "Country is required",
          }),
          z.string().optional(), // State name, optional
        ]);
        break;
      case "Progress":
        fieldSchema = z.coerce.number();
        break;
      case "Signature Input":
        fieldSchema = z.string({
          required_error: "Signature is required",
        });
        break;
      case "Smart Datetime Input":
        fieldSchema = z.date();
        break;
      case "Number":
        fieldSchema = z.coerce.number();
        break;
      case "Switch":
        fieldSchema = z.boolean();
        break;
      case "Tags Input":
        fieldSchema = z
          .array(z.string())
          .nonempty("Please enter at least one item");
        break;
      case "Multi Select":
        fieldSchema = z
          .array(z.string())
          .nonempty("Please select at least one item");
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.min !== undefined && "min" in fieldSchema) {
      fieldSchema = (fieldSchema as any).min(
        field.min,
        `Must be at least ${field.min}`
      );
    }
    if (field.max !== undefined && "max" in fieldSchema) {
      fieldSchema = (fieldSchema as any).max(
        field.max,
        `Must be at most ${field.max}`
      );
    }

    if (field.required !== true) {
      fieldSchema = fieldSchema.optional();
    }
    schemaObject[field.name] = fieldSchema as ZodTypeAny; // Ensure fieldSchema is of type ZodTypeAny
  };

  formFields.flat().forEach(processField);

  return z.object(schemaObject);
};

export const zodSchemaToString = (schema: z.ZodTypeAny): string => {
  if (schema instanceof z.ZodDefault) {
    return `${zodSchemaToString(
      schema._def.innerType
    )}.default(${JSON.stringify(schema._def.defaultValue())})`;
  }

  if (schema instanceof z.ZodBoolean) {
    return `z.boolean()`;
  }

  if (schema instanceof z.ZodNumber) {
    let result = "z.number()";
    if ("checks" in schema._def) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === "min") {
          result += `.min(${check.value})`;
        } else if (check.kind === "max") {
          result += `.max(${check.value})`;
        }
      });
    }
    return result;
  }

  if (schema instanceof z.ZodString) {
    let result = "z.string()";
    if ("checks" in schema._def) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === "min") {
          result += `.min(${check.value})`;
        } else if (check.kind === "max") {
          result += `.max(${check.value})`;
        }
      });
    }
    return result;
  }

  if (schema instanceof z.ZodDate) {
    return `z.coerce.date()`;
  }

  if (schema instanceof z.ZodArray) {
    return `z.array(${zodSchemaToString(
      schema.element
    )}).nonempty("Please at least one item")`;
  }

  if (schema instanceof z.ZodTuple) {
    return `z.tuple([${schema.items
      .map((item: z.ZodTypeAny) => zodSchemaToString(item))
      .join(", ")}])`;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const shapeStrs = Object.entries(shape).map(
      ([key, value]) => `${key}: ${zodSchemaToString(value as ZodTypeAny)}`
    );
    return `z.object({
  ${shapeStrs.join(",\n  ")}
})`;
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodSchemaToString(schema.unwrap())}.optional()`;
  }

  return "z.unknown()";
};

export const getZodSchemaString = (formFields: FormFieldOrGroup[]): string => {
  const schema = generateZodSchema(formFields);
  const schemaEntries = Object.entries(schema.shape)
    .map(([key, value]) => {
      return `  ${key}: ${zodSchemaToString(value as ZodTypeAny)}`;
    })
    .join(",\n");

  return `const formSchema = z.object({\n${schemaEntries}\n});`;
};

// New function to generate defaultValues
export const generateDefaultValues = (
  fields: FormFieldOrGroup[],
  existingDefaultValues: Record<string, any> = {}
): Record<string, any> => {
  const defaultValues: Record<string, any> = { ...existingDefaultValues };

  fields.flat().forEach((field) => {
    // Skip if field already has a default value
    if (defaultValues[field.name]) return;

    // Handle field variants
    switch (field.variant) {
      case "Multi Select":
        defaultValues[field.name] = ["React"];
        break;
      case "Tags Input":
        defaultValues[field.name] = [];
        break;
      // case 'Date Time':
      case "Smart Datetime Input":
      case "Date":
        defaultValues[field.name] = new Date();
        break;
    }
  });

  return defaultValues;
};
