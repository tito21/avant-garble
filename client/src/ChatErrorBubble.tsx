import './ChatBubble.css'

function ChatErrorBubble(props: {text: string}) {
  const { text } = props;
  return (
    <div className={"chat-bubble error"}>
      <p>{text}</p>
    </div>
  )
}

export default ChatErrorBubble
