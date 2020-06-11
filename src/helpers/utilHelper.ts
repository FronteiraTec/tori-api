export const parseQueryField = (fields?: string) =>{
  if (fields === undefined || fields === "")
    return undefined;
  return fields.replace(/[\[\]]/g, "")
    .trim()
    .split(",")
    .map((field: string) => `${field.trim()}`);
}

export const currentDate = () => {
  /* cspell: disable-next-line */
  const date = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/[\/]/g, "-").replace(",", "").trim()
    .split("-");
  const time = date[2].split(" ");
  return `${time[0]}-${date[0]}-${date[1]} ${time[1]}`;
}

export /**
 *
 *
 * @param {string[]} fields
 * @returns True if all fields are allowed and false if not
 */
const allowedFields = (fields: string[]) => {
  const availableSearchFields = [
    "assistance.id",
    "assistance.title",
    "assistance.description",
    "assistance.available",
    "assistance.total_vacancies",
    "assistance.available_vacancies",
    "assistance.date",
    "assistanceCourse.name",
    "assistanceCourse.description",
    "assistanceCourse.id",
    "subject.id",
    "subject.name",
    "subject.description",
    "assistant.id",
    "assistant.full_name",
    "assistant.created_at",
    "assistant.assistant_stars",
    "assistant.email",
    "assistant.course_id",
    "assistantCourse.id",
    "assistantCourse.name",
    "assistantCourse.description",
    "address.cep",
    "address.street",
    "address.number",
    "address.complement",
    "address.reference",
    "address.nickname",
    "address.latitude",
    "address.longitude",
    "address.assistance_id",
    "user.full_name",
    "user.created_at",
    "user.student_stars",
    "user.email",
    "user.course_id",
    "userCourse.id",
    "userCourse.name",
    "userCourse.description",
    "student.full_name",
    "student.created_at",
    "student.student_stars",
    "student.email",
    "student.course_id",
    "studentCourse.id",
    "studentCourse.name",
    "studentCourse.description"
  ];

  for (const field of fields) {
    let verifier = false;
    for (const allowed of availableSearchFields)
      verifier = verifier || (allowed === field);
    if (verifier === false)
      return false;
  }
  return true;
}

export const notAllowedFieldsSearch = (fields?: string[]) => {
  if (fields === undefined)
    return true;
  const notAllowedFields = [
    "user_id",
    "user_created_at",
    /* cspell: disable-next-line */
    "user_matricula",
    /* cspell: disable-next-line */
    "user_idUFFS",
    "user_email",
    "user_phone_number",
    "user_password",
    "user_cpf"
  ];
  for (const field of fields) {
    for (const notAllowed of notAllowedFields) {
      if (field === notAllowed || `user.${notAllowed}` === notAllowed)
        return true;
    }
  }
  return false;
}