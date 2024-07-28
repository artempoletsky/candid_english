


import Discussion from "components/dicsussion/Discussion";
import { RGetTicketDiscussion } from "../../../api/discussion/methods_discussion";
import { TestQuestion } from "app/globals";
import { userView } from "lib/language_levels";


function formatTemplate(ticket: TestQuestion): string {
  const chunks = ticket.template.split("{...}");
  let result = "";
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const options = ticket.options[i];
    const correct = ticket.correctAnswers[i];
    result += chunk;
    if (!options) break;
    result += `<strong>${options[correct]}</strong>`;
  }
  return result;
}
export default function PageExamTicket({ ticket, comments }: RGetTicketDiscussion) {
  return (
    <div className="">
      <p className="mt-6">Difficulty: {userView(ticket.difficulty)}</p>
      <p className="mb-6" dangerouslySetInnerHTML={{
        __html: formatTemplate(ticket)
      }}></p>
      <Discussion comments={comments} discussionId={ticket.discussionId} />
    </div>
  );
}