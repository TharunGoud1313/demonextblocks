import { FieldType } from "@/types";
import { Area } from "recharts";

export const fieldTypes: FieldType[] = [
  // {name: "Send Media Card", isNew: false },
  { name: "Text Area", isNew: false },
  { name: "Check box label", isNew: false },
  { name: "Label", isNew: false },
  { name: "Text Box", isNew: false },
  { name: "Number", isNew: false },
  { name: "Mobile", isNew: false },
  { name: "OTP", isNew: false },
  { name: "Email", isNew: false },
  { name: "Password", isNew: false },
  { name: "Date", isNew: false },
  { name: "Time", isNew: false },
  { name: "From Time to To Time", isNew: false },
  { name: "From Date to To Date", isNew: false },
  { name: "Date Time", isNew: true },
  { name: "Dropdown", isNew: false },
  { name: "Check Box", isNew: false },
  { name: "Badge", isNew: false },
  { name: "Radio Group", isNew: false },
  { name: "Slider", isNew: false },
  { name: "Switch", isNew: false },
  { name: "Seperator", isNew: false },
  { name: "Combobox", isNew: false },
  { name: "Multi Select", isNew: false },
  { name: "Image Upload", isNew: false },
  { name: "File Upload", isNew: false },
  { name: "PDF Upload", isNew: false },
  { name: "Video Upload", isNew: false },
  { name: "Send Image", isNew: false },
  { name: "Send Video", isNew: false },
  { name: "Send File", isNew: false },
  { name: "Send Pdf", isNew: false },
  { name: "Send Rating", isNew: false },
  { name: "Send Review", isNew: false },
  { name: "Send Media Card", isNew: false },
  { name: "Analytic Card", isNew: false },
  { name: "Chat with Data", isNew: false },
  { name: "Chat with Data Auto", isNew: false },
  { name: "Location Select", isNew: true },
  { name: "Tool Tip Card", isNew: true },
  { name: "Progress", isNew: true },
  { name: "Media Card", isNew: true },
  { name: "Media Card & Social Icons", isNew: true },
  { name: "Bar Chart with Social", isNew: true },
  // { name: 'Tab Seperator', isNew: false },
  { name: "Iframe", isNew: false },
];

export const defaultFieldConfig: Record<
  string,
  { label: string; description: string; placeholder?: any }
> = {
  "Check Box": {
    label: "Check Box",
    description:
      "You can manage your mobile notifications in the mobile settings page.",
  },

  "Radio Group": {
    label: "Radio Group",
    description:
      "You can manage your mobile notifications in the mobile settings page.",
  },
  Badge: {
    label: "Badge",
    description: "Select from the options below.",
  },
  Progress: {
    label: "Progress",
    description: "Select from the options below.",
  },
  "Search Lookup": {
    label: "Choose your framework",
    description: "Select from the options below.",
  },
  "Tab Seperator": {
    label: "Select your framework",
    description: "Select from the options below.",
  },
  Combobox: {
    label: "Combobox",
    description: "This is the language that will be used in the dashboard.",
  },
  Date: {
    label: "Date",
    description: "Your date of birth is used to calculate your age.",
  },
  "Date Time": {
    label: "Date Time",
    description: "Add the date of submission with detailly.",
  },
  "File Upload": {
    label: "Select File",
    description: "Select a file to upload.",
  },
  "Image Upload": {
    label: "Select Image",
    description: "Upload your profile picture.",
  },
  "Text Box": {
    label: "Text Box",
    description: "",
    placeholder: "Text Box",
  },
  Email: {
    label: "Email",
    description: "",
    placeholder: "Email Address",
  },
  OTP: {
    label: "One-Time Password",
    description: "Please enter the one-time password sent to your phone.",
  },
  "Location Select": {
    label: "Select Country",
    description:
      "If your country has states, it will be appear after selecting country",
  },
  "Multi Select": {
    label: "Multi Select",
    description: "Select multiple options.",
  },
  Dropdown: {
    label: "Dropdown",
    description: "You can manage email addresses in your email settings.",
    placeholder: "Select a verified email to display",
  },
  Slider: {
    label: "Slider",
    description: "Adjust the price by sliding.",
  },
  "Signature Input": {
    label: "Sign here",
    description: "Please provide your signature above",
  },
  "Smart Datetime Input": {
    label: "What's the best time for you?",
    description: "Please select the full time",
  },
  Switch: {
    label: "Switch",
    description: "Receive emails about new products, features, and more.",
  },
  "Tags Input": { label: "Enter your tech stack.", description: "Add tags." },
  "Text Area": {
    label: "Text Area",
    description: "",
  },
  Password: {
    label: "Password",
    description: "Enter your password.",
  },
  Number: {
    label: "Number",
    description: "Enter your Number.",
  },
  Mobile: {
    label: "Phone number",
    description: "Enter your phone number.",
  },
};
