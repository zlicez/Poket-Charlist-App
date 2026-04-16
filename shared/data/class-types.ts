import type { AbilityName } from "./d5e-constants";

export type ClassSourceCode = "PHB" | "ERLW" | "TCE" | "CUSTOM";
export type ClassEntityType = "class" | "subclass";
export type ClassSpellcastingProgressionKind =
  | "none"
  | "full"
  | "half"
  | "third"
  | "artificer"
  | "pact";
export type ClassSpellcastingMode =
  | "prepared"
  | "known"
  | "spellbook"
  | "pact"
  | "none";
export type ClassChoiceKind = "skill" | "tool" | "language" | "option";
export type ClassResourceReset = "shortRest" | "longRest" | "none";
export type ClassEffectType =
  | "grant_proficiency_armor"
  | "grant_proficiency_weapon"
  | "grant_proficiency_tool"
  | "grant_proficiency_skill"
  | "grant_language"
  | "grant_subclass_unlock"
  | "grant_spellcasting"
  | "grant_resource";

export interface ClassContentRef {
  id: string;
  name: string;
  source: ClassSourceCode;
  contentVersion?: string;
}

export interface ClassChoiceDefinition {
  id: string;
  label: string;
  kind: ClassChoiceKind;
  count: number;
  options: string[] | "any";
  required?: boolean;
}

export interface ClassProficiencyBlock {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
  skills?: string[];
  choices?: ClassChoiceDefinition[];
}

export interface ClassEffect {
  type: ClassEffectType;
  value?: string | string[] | number;
  condition?: string;
}

export interface ClassFeatureDefinition extends ClassContentRef {
  entityType?: "feature";
  description: string;
  effects?: ClassEffect[];
  optional?: boolean;
  replacesFeatureId?: string;
}

export interface ClassOptionItem extends ClassContentRef {
  description?: string;
  effects?: ClassEffect[];
}

export interface ClassOptionGroup extends ClassContentRef {
  selectionMode: "single" | "multiple";
  choose: number;
  items: ClassOptionItem[];
  requiredAtLevel?: number;
}

export interface ClassResourceDefinition extends ClassContentRef {
  resetOn: ClassResourceReset;
  maxByLevel: Partial<Record<number, number>>;
}

export interface ClassSpellcastingDefinition {
  ability: AbilityName;
  progression: ClassSpellcastingProgressionKind;
  mode: ClassSpellcastingMode;
  startsAtLevel?: number;
}

export interface ClassLevelGrant {
  level: number;
  featureIds?: string[];
  optionGroupIds?: string[];
  resourceIds?: string[];
}

export interface SubclassDefinition extends ClassContentRef {
  entityType: "subclass";
  classId: string;
  unlockLevel: number;
  description: string;
  featureDefinitions?: Record<string, ClassFeatureDefinition>;
  levelGrants?: ClassLevelGrant[];
  optionGroups?: Record<string, ClassOptionGroup>;
  spellcasting?: Partial<ClassSpellcastingDefinition>;
}

export interface ClassDefinition extends ClassContentRef {
  entityType: "class";
  legacyName?: string;
  description: string;
  hitDie: {
    dice: string;
    value: number;
  };
  savingThrows: AbilityName[];
  startingProficiencies: ClassProficiencyBlock;
  multiclassProficiencies?: ClassProficiencyBlock;
  subclassRule?: {
    unlockLevel: number;
    optional?: boolean;
    allowCustom?: boolean;
  };
  spellcasting?: ClassSpellcastingDefinition;
  featureDefinitions?: Record<string, ClassFeatureDefinition>;
  optionGroups?: Record<string, ClassOptionGroup>;
  resourceDefinitions?: Record<string, ClassResourceDefinition>;
  levelGrants?: ClassLevelGrant[];
  subclasses?: Record<string, SubclassDefinition>;
}
