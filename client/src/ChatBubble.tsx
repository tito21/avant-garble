import "./ChatBubble.css"

function ChatBubble(props: {text: string, direction: 'left' | 'right', id: number}) {
  const { text, direction, id } = props;

  return (
    <div className={"chat-bubble " +  direction} key={id} id={id.toString()}>
      <p>{text}</p>
    </div>
  )
}

export default ChatBubble
