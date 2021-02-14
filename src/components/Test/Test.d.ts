import * as React from "react";
import { FormsyInjectedProps } from "formsy-react";

export interface TestPropsVariantOverrides {}
export type TestVariantDefaults = Record<"filled" | "outlined", true>;

export interface TestProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Comment */
  children?: React.ReactNode;
  /** Comment */
  classes?: {
    root?: string;
    filled?: string;
  };
  /** Comment */
  color?: "inherit" | "primary" | "secondary" | "grey";
  // formsy?: FormsyInjectedProps<string | number>;
}

export type TestClassKey = keyof NonNullable<TestProps["classes"]>;
export default function Test(props: TestProps): JSX.Element;
