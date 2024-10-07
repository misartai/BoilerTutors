import java.time.LocalDateTime;
public class MessageController {

    private messageService messageService;
    private LocalDateTime timestamp = LocalDateTime.now();

    public List<Message> getMessagesForUser(String userID) {
        return messageService.getMessagesByUserID(userID);
    }

    public List<User> getContactsForUser(String userID) {
        return messageService.getContactsForUser(userID);
    }

    public String sendMessage(Message message) {
        messageService.sendMessage(message);
        return "Sent Successfully" + timestamp.toString();
    }
}
