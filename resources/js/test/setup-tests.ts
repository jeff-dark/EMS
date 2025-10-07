import '@testing-library/jest-dom'
// jest-axe exports an object with the matcher property in some ESM interop scenarios
// so we normalize it here.
import * as jestAxe from 'jest-axe'
// @ts-ignore
const matcher = (jestAxe as any).toHaveNoViolations || (jestAxe as any).default?.toHaveNoViolations
if (typeof matcher === 'function') {
	// @ts-ignore
	expect.extend({ toHaveNoViolations: matcher })
}
