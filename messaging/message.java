
import java.time.LocalDateTime;

class Message {

    private String message_content;
    private String recipient;
    private String sender;
    private LocalDateTime time_sent;

    public Message

    {
        this.message_content = message_content;
        this.sender = sender;
        this.recipient = recipient;
        this.time_sent = LocalDateTime.now();
    }

    public String getSender() {
        return sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getMessageContent() {
        return message_content;
    }

    public LocalDateTime getTimeSent() {
        return time_sent;
    }

    public toString() {
        return "From: " + sender + "\n To: " + recipient + "\n Content: " + message_content + "\n Time Sent: " + time_sent.toString();
    }
}
