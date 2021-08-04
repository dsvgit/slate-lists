import makeDeleteBackward from "todoList/withList/makeDeleteBackward";
import makeInsertBreak from "todoList/withList/makeInsertBreak";

const withList = (editor) => {
  editor.insertBreak = makeInsertBreak(editor);
  editor.deleteBackward = makeDeleteBackward(editor);

  return editor;
};

export default withList;
