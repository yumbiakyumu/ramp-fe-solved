import classNames from "classnames"
import { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)
/*
  Approach taken bug2 fix:
  The goal is to fix the issue where clicking on the checkbox does not toggle its value as expected.
  In the old code, the label for attribute was missing, which could have caused the checkbox not to function correctly.
  The new code adds the htmlFor attribute to the label element, associating it with the input checkbox using the inputId, which is essential for accessibility and ensures proper functionality.
*/
  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        htmlFor={inputId}//attribute added to fix bug 2
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      />
      <input
        id={inputId}
        type="checkbox"
        className="RampInputCheckbox--input"
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(!checked)}
      />
    </div>
  )
}
