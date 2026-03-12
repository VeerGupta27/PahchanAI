import { useRole } from "./context/RoleContext";
import "./dashboard.css";

export default function RoleBadge({ size = "md" }) {
  const { role, meta } = useRole();
  return (
    <span
      className={`role-badge role-badge--${size}`}
      style={{
        color:       meta.color,
        background:  meta.color + "15",
        borderColor: meta.color + "40",
      }}
    >
      {meta.badge}
    </span>
  );
}
