import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function PageShell({ children, active }) {
  return <><SiteHeader active={active} />{children}<SiteFooter /></>;
}
