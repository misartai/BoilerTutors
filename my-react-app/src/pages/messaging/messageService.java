public class messageService {

    private MongoTemplate mongoTemplate;

    public List<Message> getMessagesByUserID(String userID) {
        Query query = new Query();
        query.addCriteria(Criteria.where("reciever").is(userID));

        return mongoTemplate.find(query, Message.class);
    }

    public List<User> getContactsForUser(String userID) {
        Query query = new Query();
        query.addCriteria(Criteria.where("sender").is(userID));

        return mongoTemplate.findDistinct(query, "reciever", Message.class, User.class);
    }

    public void sendMessage(Message message) {
        mongoTemplate.save(message);
    }
}
