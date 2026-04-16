import type { ClassDefinition } from "../data/class-types";

export interface LegacyClassEntryLike {
  name: string;
  level: number;
  subclass?: string;
}

export interface ClassSelectionLike {
  id: string;
  classId: string;
  className: string;
  source: string;
  contentVersion?: string;
  level: number;
  subclassId?: string;
  subclassName?: string;
  choices: Record<string, unknown>;
  optionalFeatureIds: string[];
  resourceState?: Record<string, unknown>;
  notes?: string;
}

export interface LegacyClassStateLike {
  class: string;
  level: number;
  subclass?: string;
  classes?: LegacyClassEntryLike[];
  classSelections?: ClassSelectionLike[];
}

export interface LegacyProjection {
  class: string;
  subclass?: string;
  level: number;
  classes: LegacyClassEntryLike[];
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function getClassSelectionId(
  classId: string,
  index: number,
): string {
  return `class-selection-${index + 1}-${classId}`;
}

export function buildClassSelectionsFromLegacy(
  character: LegacyClassStateLike,
  findDefinitionByName: (name: string) => ClassDefinition | undefined,
): ClassSelectionLike[] {
  const legacyClasses =
    character.classes && character.classes.length > 0
      ? character.classes
      : [
          {
            name: character.class,
            level: character.level,
            subclass: character.subclass,
          },
        ];

  if (character.classSelections && character.classSelections.length > 0) {
    const projected = projectLegacyClassState(character.classSelections);
    const hasMismatch =
      projected.classes.length !== legacyClasses.length ||
      projected.classes.some((entry, index) => {
        const legacyEntry = legacyClasses[index];
        return (
          entry.name !== legacyEntry?.name ||
          entry.level !== legacyEntry?.level ||
          entry.subclass !== legacyEntry?.subclass
        );
      });

    if (!hasMismatch) {
      return character.classSelections.map((selection, index) => ({
        ...selection,
        id:
          selection.id ||
          getClassSelectionId(
            selection.classId || slugify(selection.className),
            index,
          ),
        classId: selection.classId || slugify(selection.className),
        className: selection.className || character.class,
        source: selection.source || "CUSTOM",
        contentVersion: selection.contentVersion || "2014",
        level: Math.max(1, Math.min(20, selection.level || 1)),
        choices: selection.choices ?? {},
        optionalFeatureIds: selection.optionalFeatureIds ?? [],
      }));
    }
  }

  return legacyClasses.map((entry, index) => {
    const definition = findDefinitionByName(entry.name);
    const classId = definition?.id ?? slugify(entry.name);
    const subclass = entry.subclass?.trim();

    return {
      id: getClassSelectionId(classId, index),
      classId,
      className: definition?.name ?? entry.name,
      source: definition?.source ?? "CUSTOM",
      contentVersion: definition?.contentVersion ?? "2014",
      level: Math.max(1, Math.min(20, entry.level || 1)),
      subclassId: subclass ? slugify(subclass) : undefined,
      subclassName: subclass || undefined,
      choices: {},
      optionalFeatureIds: [],
    };
  });
}

export function projectLegacyClassState(
  selections: ClassSelectionLike[],
): LegacyProjection {
  const classes = selections.map((selection) => ({
    name: selection.className,
    level: selection.level,
    subclass: selection.subclassName,
  }));

  const primary = classes[0] ?? { name: "", level: 1, subclass: undefined };

  return {
    class: primary.name,
    subclass: primary.subclass,
    level: Math.min(20, classes.reduce((sum, entry) => sum + entry.level, 0)),
    classes,
  };
}
