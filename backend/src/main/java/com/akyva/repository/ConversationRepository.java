package com.akyva.repository;

import com.akyva.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("SELECT c FROM Conversation c JOIN c.members m WHERE m.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findConversationsByUserId(@Param("userId") String userId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN c.members m1 JOIN c.members m2 " +
           "WHERE c.type = com.akyva.entity.enums.ConversationType.DIRECT " +
           "AND m1.user.id = :user1Id AND m2.user.id = :user2Id")
    List<Conversation> findDirectConversationBetween(@Param("user1Id") String user1Id, @Param("user2Id") String user2Id);
}
