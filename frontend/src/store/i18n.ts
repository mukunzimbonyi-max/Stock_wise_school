import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "English" | "Kinyarwanda" | "Français";

interface I18nStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: "English",
      setLanguage: (language) => set({ language }),
    }),
    { name: "sfsms-language" }
  )
);

const translations = {
  English: {
    settings: "Settings",
    settingsSubtitle: "Personalise the system and manage your data",
    profile: "Profile Settings",
    profileDesc: "Your account details",
    fullName: "Full name",
    email: "Email",
    role: "Role",
    saveProfile: "Save profile",
    changePassword: "Change Password",
    changePwdDesc: "Keep your account secure",
    currentPwd: "Current password",
    newPwd: "New password",
    confirmPwd: "Confirm new password",
    updatePwd: "Update password",
    notifications: "Notifications",
    notifDesc: "Choose what the system alerts you about",
    lowStock: "Low stock warnings",
    delivery: "New delivery recorded",
    weekly: "Weekly summary email",
    appearance: "Appearance & Language",
    appDesc: "Theme and interface language",
    darkMode: "Dark mode",
    language: "Language",
    backup: "Data Backup & Restore",
    backupDesc: "Your records are stored in this browser",
    downloadBackup: "Download backup",
    restoreBackup: "Restore backup",
  },
  Kinyarwanda: {
    settings: "Igenamiterere",
    settingsSubtitle: "Hindura uko urubuga rukora n'amakuru yawe",
    profile: "Ibisobanuro byawe",
    profileDesc: "Amakuru y'injira ryawe",
    fullName: "Amazina yombi",
    email: "Imeli",
    role: "Inshingano",
    saveProfile: "Bika amakuru",
    changePassword: "Hindura Ijambobanga",
    changePwdDesc: "Rinda konti yawe",
    currentPwd: "Ijambobanga ry'ubu",
    newPwd: "Ijambobanga rishya",
    confirmPwd: "Emeza ijambobanga rishya",
    updatePwd: "Emeza impinduka",
    notifications: "Amamenyesha",
    notifDesc: "Hitamo amakuru wifuza kumenyeshwa",
    lowStock: "Ibiribwa bigiye gushira",
    delivery: "Ibiribwa byinjiye",
    weekly: "Raporo y'icyumweru",
    appearance: "Isura n'Ururimi",
    appDesc: "Guhindura isura n'ururimi rw'urubuga",
    darkMode: "Ibara ryirabura",
    language: "Ururimi",
    backup: "Kubika no Gusubiza Amakuru",
    backupDesc: "Amakuru abitse muri iyi browser",
    downloadBackup: "Manura amakuru (Backup)",
    restoreBackup: "Subiza amakuru",
  },
  Français: {
    settings: "Paramètres",
    settingsSubtitle: "Personnalisez le système et gérez vos données",
    profile: "Paramètres du Profil",
    profileDesc: "Détails de votre compte",
    fullName: "Nom complet",
    email: "Email",
    role: "Rôle",
    saveProfile: "Enregistrer",
    changePassword: "Changer le mot de passe",
    changePwdDesc: "Sécurisez votre compte",
    currentPwd: "Mot de passe actuel",
    newPwd: "Nouveau mot de passe",
    confirmPwd: "Confirmer le mot de passe",
    updatePwd: "Mettre à jour",
    notifications: "Notifications",
    notifDesc: "Choisissez vos alertes",
    lowStock: "Alertes de stock faible",
    delivery: "Nouvelle livraison",
    weekly: "Résumé hebdomadaire",
    appearance: "Apparence et Langue",
    appDesc: "Thème et langue de l'interface",
    darkMode: "Mode sombre",
    language: "Langue",
    backup: "Sauvegarde et Restauration",
    backupDesc: "Vos données sont stockées ici",
    downloadBackup: "Télécharger la sauvegarde",
    restoreBackup: "Restaurer la sauvegarde",
  }
};

export function useTranslation() {
  const { language } = useI18n();
  return {
    t: (key: keyof typeof translations.English) => translations[language]?.[key] || translations.English[key],
    lang: language,
    setLanguage: useI18n.getState().setLanguage
  };
}
