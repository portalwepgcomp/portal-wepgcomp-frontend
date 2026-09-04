// react-input-mask não publica tipos próprios (lib sem manutenção ativa).
// Declaração mínima para satisfazer noImplicitAny e tipar o render-prop.
declare module "react-input-mask" {
  import * as React from "react";

  interface InputMaskProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    mask?: string;
    maskChar?: string | null;
    alwaysShowMask?: boolean;
    children?: (
      inputProps: React.InputHTMLAttributes<HTMLInputElement>,
    ) => React.ReactNode;
  }

  const InputMask: React.FC<InputMaskProps>;
  export default InputMask;
}
