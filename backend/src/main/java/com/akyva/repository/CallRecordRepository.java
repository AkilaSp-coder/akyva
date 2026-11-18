package com.akyva.repository;

import com.akyva.entity.CallRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CallRecordRepository extends JpaRepository<CallRecord, String> {

    @Query("SELECT c FROM CallRecord c WHERE c.caller.id = :userId OR c.receiver.id = :userId ORDER BY c.startedAt DESC")
    List<CallRecord> findUserCalls(@Param("userId") String userId);
}
