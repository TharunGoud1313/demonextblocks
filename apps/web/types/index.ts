import type { ColumnSort, Row } from "@tanstack/react-table";
import type { z } from "zod";

import type { DataTableConfig } from "@/config/data-table";
import type { filterSchema } from "@/lib/parsers";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type StringKeyOf<TData> = Extract<keyof TData, string>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: StringKeyOf<TData>;
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[];

export type ColumnType = DataTableConfig["columnTypes"][number];

export type FilterOperator = DataTableConfig["globalOperators"][number];

export type JoinOperator = DataTableConfig["joinOperators"][number]["value"];

export interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>;
  label: string;
  placeholder?: string;
  options?: Option[];
  multiple?: boolean;
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  type: ColumnType;
}

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>;
  }
>;

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  type: "new" | "update" | "delete" | "view";
}

export interface QueryBuilderOpts {
  where?: any;
  orderBy?: any;
  distinct?: boolean;
  nullish?: boolean;
}

import { Icons } from "@/components/icons";
import * as Locales from "date-fns/locale";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export type FormFieldType = {
  type: string;
  variant: string;
  name: string;
  variant_code?: string;
  validation_message?: string;
  label: string;
  placeholder?: string;
  description?: string;
  options?: string[];
  combobox?: string[];
  media_card_data?: {
    media_url?: string;
    card_type?: string;
    custom_html?: string;
    card_json?: string[];
    action_urls?: {
      like?: string;
      favorite?: string;
      task?: string;
      chat?: string;
      share?: string;
    };
    component_name?: string;
  };
  chat_with_data?: {
    buttons: [
      {
        button_text: string;
        prompt: string;
        api_response: string[];
        dataApi_response: string[];
        // response_data: string[];
        enable_api: boolean;
        enable_dataApi: boolean;
        enable_prompt: boolean;
        promptDataFilter: string;
        apiDataFilter: string;
        component_name?: string;
        metricApi?: string;
        metricApiEnabled?: boolean;
      }
    ];
  };
  multiselect?: string[];
  radiogroup?: string[];
  placeholder_file_url?: string;
  placeholder_video_url?: string;
  placeholder_file_upload_url?: string;
  placeholder_pdf_file_url?: string;
  disabled: boolean;
  value: string | boolean | Date | number | string[];
  setValue: (value: string | boolean) => void;
  checked: boolean;
  onChange: (
    value: string | string[] | boolean | Date | number | number[]
  ) => void;
  onSelect: (
    value: string | string[] | boolean | Date | number | number[]
  ) => void;
  rowIndex: number;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  locale?: keyof typeof Locales;
  hour12?: boolean;
  className?: string;
};

export type AgentFieldType = {
  type: string;
  variant: string;
  name: string;
  variant_code?: string;
  validation_message?: string;
  label: string;
  placeholder?: string;
  description?: string;
  options?: string[];
  combobox?: string[];
  use_settings_upload?: boolean;
  media_card_data?: {
    media_url?: string;
    card_type?: string;
    custom_html?: string;
    card_json?: string[];
    use_upload?: boolean;
    action_urls?: {
      like?: string;
      favorite?: string;
      task?: string;
      chat?: string;
      share?: string;
    };
    component_name?: string;
  };
  chat_with_data?: {
    buttons: [
      {
        button_text: string;
        prompt: string;
        api_response: string[];
        dataApi_response: string[];
        // response_data: string[];
        enable_api: boolean;
        enable_dataApi: boolean;
        enable_prompt: boolean;
        promptDataFilter: string;
        apiDataFilter: string;
        component_name?: string;
        metricApi?: string;
        metricApiEnabled?: boolean;
        storyApiEnabled?: boolean;
        storyName?: string;
        storyCode?: string;
      }
    ];
  };
  multiselect?: string[];
  radiogroup?: string[];
  placeholder_file_url?: string;
  placeholder_video_url?: string;
  placeholder_file_upload_url?: string;
  placeholder_pdf_file_url?: string;
  disabled: boolean;
  value: string | boolean | Date | number | string[];
  setValue: (value: string | boolean) => void;
  checked: boolean;
  onChange: (
    value: string | string[] | boolean | Date | number | number[]
  ) => void;
  onSelect: (
    value: string | string[] | boolean | Date | number | number[]
  ) => void;
  rowIndex: number;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  locale?: keyof typeof Locales;
  hour12?: boolean;
  className?: string;
};

export type FieldType = { name: string; isNew: boolean; index?: number };

export type DocFieldType = { name: string; isNew: boolean; index?: number };

