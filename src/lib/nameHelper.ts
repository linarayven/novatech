// Утиліти для роботи з іменами
export const formatFullName = (firstName: string, patronymic: string | null | undefined, lastName: string): string => {
  return `${firstName}${patronymic ? ' ' + patronymic : ''} ${lastName}`.trim();
};

export const parseFullName = (fullName: string): { firstName: string; patronymic: string; lastName: string } => {
  const parts = fullName ? fullName.trim().split(/\s+/) : [];
  let firstName = "";
  let patronymic = "";
  let lastName = "";

  if (parts.length === 2) {
    [firstName, lastName] = parts;
  } else if (parts.length >= 3) {
    firstName = parts[0];
    patronymic = parts[1];
    lastName = parts.slice(2).join(" ");
  } else if (parts.length === 1) {
    firstName = parts[0];
  }

  return { firstName, patronymic, lastName };
};
