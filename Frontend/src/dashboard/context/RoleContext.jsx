import { createContext, useContext } from "react";

/* ─── Role definitions ──────────────────────────────────────── */
export const ROLES = {
  OFFICER: "officer",
  PARTNER: "partner",
  CITIZEN: "citizen",
};

export const ROLE_META = {
  officer: {
    label:       "Police Officer",
    color:       "#3b82f6",
    badge:       "OFFICER",
    initials:    "PO",
    description: "Full access — manage cases, confirm matches, view all data",
  },
  partner: {
    label:       "Partner Organisation",
    color:       "#22d3ee",
    badge:       "PARTNER",
    initials:    "PA",
    description: "Read-only access to cases and map — can report sightings",
  },
  citizen: {
    label:       "Citizen",
    color:       "#22c55e",
    badge:       "PUBLIC",
    initials:    "CI",
    description: "Can only report sightings",
  },
};

/* ─── Permissions matrix ────────────────────────────────────── */
export const PERMISSIONS = {
  // Nav pages — controls sidebar visibility
  nav_dashboard:      { officer: true,  partner: true,  citizen: false },
  nav_missing:        { officer: true,  partner: true,  citizen: false },
  nav_sighting:       { officer: true,  partner: true,  citizen: true  },
  nav_ai_match:       { officer: true,  partner: false, citizen: false },
  nav_map:            { officer: true,  partner: true,  citizen: false },
  nav_timeline:       { officer: true,  partner: true,  citizen: false },
  nav_alerts:         { officer: true,  partner: true,  citizen: false },

  // Actions
  action_confirm_match:  { officer: true,  partner: false, citizen: false },
  action_discard_match:  { officer: true,  partner: false, citizen: false },
  action_register_case:  { officer: true,  partner: false, citizen: false },
  action_update_case:    { officer: true,  partner: false, citizen: false },
  action_export_data:    { officer: true,  partner: false, citizen: false },

  // Data visibility
  data_full_stats:       { officer: true,  partner: false, citizen: false },
  data_contact_info:     { officer: true,  partner: false, citizen: false },
  data_biometrics:       { officer: true,  partner: false, citizen: false },
  data_live_location:    { officer: true,  partner: true,  citizen: false },

  // Explorer
  explorer_can_edit:     { officer: true,  partner: false, citizen: false },

  // Alerts
  alerts_see_matches:    { officer: true,  partner: false, citizen: false },
  alerts_see_sightings:  { officer: true,  partner: true,  citizen: false },
  alerts_see_system:     { officer: true,  partner: false, citizen: false },
};

/* ─── Helper ────────────────────────────────────────────────── */
export function can(role, permission) {
  return PERMISSIONS[permission]?.[role] ?? false;
}

/* ─── Default landing page per role ────────────────────────── */
export const DEFAULT_NAV = {
  officer: "dashboard",
  partner: "dashboard",
  citizen: "sighting",
};

/* ─── Context ───────────────────────────────────────────────── */
const RoleContext = createContext(null);

// role is passed from your auth system — no internal state here
export function RoleProvider({ role, children }) {
  const value = {
    role,
    can: (permission) => can(role, permission),
    meta: ROLE_META[role],
  };
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside <RoleProvider>");
  return ctx;
}
