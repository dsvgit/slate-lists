import styles from "todoList/elements/TodoListItem/TreeItem.module.scss";

const Handle = ({ active, className, cursor, style, ...props }) => {
  return (
    <div
      contentEditable={false}
      {...props}
      className={styles.Handle}
      style={{
        ...style,
        cursor,
        "--fill": active?.fill,
        "--background": active?.background,
      }}
    />
  );
};

export default Handle;
