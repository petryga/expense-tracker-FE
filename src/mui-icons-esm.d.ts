// @mui/icons-material has no `exports` field, so a deep import like
// '@mui/icons-material/Download' resolves to the CJS build, and Vite 8's
// Rolldown-based dep pre-bundler mis-handles that file's CJS interop
// (it exports the raw `{ default }` wrapper instead of unwrapping it),
// causing "React.jsx: type is invalid ... but got: object" at runtime.
// Importing the package's esm/ build sidesteps that broken interop path,
// but only the CJS deep-import path ships a .d.ts, hence this declaration.
declare module '@mui/icons-material/esm/*' {
  import { SvgIconComponent } from '@mui/icons-material';
  const Icon: SvgIconComponent;
  export default Icon;
}
