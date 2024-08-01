import { formWrapper } from "./FormPostComment";


export function postLinkOver(discussion: HTMLDivElement, link: HTMLSpanElement) {
  const commentId = parseInt(link.dataset["comment"]!);
  const commentDiv = document.getElementById(`comment${commentId}`);
  if (!commentDiv) return;
  // console.log(commentDiv);
  const offsetTop = commentDiv.offsetTop;
  const scrollY = window.scrollY;
  const wH = window.innerHeight;
  if (offsetTop > scrollY && offsetTop < scrollY + wH) {
    commentDiv.classList.add("highlighted")
  } else {
    // console.log(scrollY);
    let wrapper = document.getElementById("CommentHoverWrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "CommentHoverWrapper";
      document.body.appendChild(wrapper);
    }

    wrapper.innerHTML = commentDiv.outerHTML;
    wrapper.children[0].removeAttribute("id");

    const plLeft = link.offsetLeft;
    const plTop = link.offsetTop;
    wrapper.style.position = "absolute";
    wrapper.style.left = `${plLeft}px`;
    wrapper.style.top = `${plTop - wrapper.offsetHeight - 10}px`;
  }
}

export function postLinkOut(discussion: HTMLDivElement, link: HTMLSpanElement) {
  const commentId = parseInt(link.dataset["comment"]!);
  const commentDiv = document.getElementById(`comment${commentId}`)! as HTMLDivElement;
  if (!commentDiv) return;
  commentDiv.classList.remove("highlighted")
  const wrapper = document.getElementById("CommentHoverWrapper");
  if (wrapper) {
    wrapper.remove();
  }
}

export function scrollToComment(commentId: number) {
  if (commentId == 0) {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
    return;
  }
  const commentDiv = document.getElementById(`comment${commentId}`)! as HTMLDivElement;
  if (!commentDiv) return;
  const offsetTop = commentDiv.offsetTop;
  window.scrollTo({
    behavior: "smooth",
    top: offsetTop - 10,
  });
}


export function replyClick(commentId: number) {

  const val = formWrapper.form!.getValues().text;
  let add = ">>" + (commentId == 0 ? "OP" : commentId) + "\n";
  formWrapper.form!.setFieldValue("text", val + add);
  const form = document.getElementById("FormPostComment")! as HTMLFormElement;
  if (commentId == 0) {
    const container = document.getElementById("CommentsContainer")!;
    container.prepend(form);
  } else {
    const commentDiv = document.getElementById(`comment${commentId}`)! as HTMLDivElement;
    commentDiv.after(form);
  }

}