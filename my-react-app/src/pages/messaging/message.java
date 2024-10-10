
import java.time.LocalDateTime;

class Message {
    //sets up Message class which will be used in conjunction with components from user DB
    private String message_content;
    private String recipient;
    private String sender;
    private LocalDateTime time_sent;
    private boolean isAnnouncement;

    public Message

    {
        this.messageContent = messageContent;
        this.sender = sender;
        this.recipient = recipient;
        this.timeSent = LocalDateTime.now();
        this.isAnnouncement = isAnnouncement;
    }

    public String getSender() {
        return sender;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getMessageContent() {
        return messageContent;
    }

    public LocalDateTime getTimeSent() {
        return timeSent;
    }

    public boolean getAnnouncementStatus() {
        return isAnnouncement;
    }

    public toString() {
        return "From: " + sender + "\n To: " + recipient + "\n Content: " + messageContent + "\n Time Sent: " + timeSent.toString();
    }
}
