import java.util*;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

public class mongoDBaccess {
  public static void main(String[] args) {
       String server "servername//localhost::2000"; //change with connection later

      MongoClient mongoC = new MongoClient(new MongoClient(server));
      MongoDatabase mongoDB = new MongoDatabase(new MongoDatabase("testDB"));
      MongoCollection<Document> collection = database.getCollection("User");

      Document user = new Document("name", "J. Doe");
           .append("classes", Arrays.asList("MA101", "BIOL201", "CS109"));
      collection.insertOne(user); //collection acts as 'user book'

      Document curStudent = collection.find().first();

      //can do error handling from here

      mongoC.close();
  }
}
