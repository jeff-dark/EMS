import '@testing-library/jest-dom'
// jest-axe exports an object with the matcher property in some ESM interop scenarios
// so we normalize it here.
import { toHaveNoViolations } from 'jest-axe'
// jest-axe exports an object containing { toHaveNoViolations: { toHaveNoViolations(fn) } }
// So we need the inner function.
// @ts-ignore
const matcherFn = (toHaveNoViolations as any).toHaveNoViolations || toHaveNoViolations
if (typeof matcherFn === 'function') {
	// @ts-ignore
	expect.extend({ toHaveNoViolations: matcherFn })
}
