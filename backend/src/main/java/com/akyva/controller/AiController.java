package com.akyva.controller;

import com.akyva.ai.AiService;
import com.akyva.dto.ai.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features", description = "Pluggable AI services: Smart replies, translation, rewriting, summaries, and scam detection")
public class AiController {

    private final AiService aiService;

    @PostMapping("/smart-replies")
    @Operation(summary = "Generate 3-4 contextual smart reply suggestions for composer")
    public ResponseEntity<SmartReplyResponse> getSmartReplies(@Valid @RequestBody SmartReplyRequest request) {
        List<String> suggestions = aiService.generateReplySuggestions(request.getLastMessage(), request.getRecentMessages());
        return ResponseEntity.ok(SmartReplyResponse.builder().suggestions(suggestions).build());
    }

    @PostMapping("/translate")
    @Operation(summary = "Translate message content into desired target language")
    public ResponseEntity<TranslateResponse> translate(@Valid @RequestBody TranslateRequest request) {
        String translated = aiService.translateMessage(request.getText(), request.getSourceLanguage(), request.getTargetLanguage());
        return ResponseEntity.ok(TranslateResponse.builder()
                .originalText(request.getText())
                .translatedText(translated)
                .sourceLanguage(request.getSourceLanguage())
                .targetLanguage(request.getTargetLanguage())
                .build());
    }

    @PostMapping("/rewrite")
    @Operation(summary = "Rewrite message draft into Professional, Friendly, Shorter, or Clearer tone")
    public ResponseEntity<RewriteResponse> rewrite(@Valid @RequestBody RewriteRequest request) {
        String rewritten = aiService.rewriteMessage(request.getText(), request.getTone());
        return ResponseEntity.ok(RewriteResponse.builder()
                .originalText(request.getText())
                .rewrittenText(rewritten)
                .tone(request.getTone())
                .build());
    }

    @PostMapping("/summarize")
    @Operation(summary = "Summarize chat transcripts into executive points and action items")
    public ResponseEntity<SummarizeResponse> summarize(@Valid @RequestBody SummarizeRequest request) {
        SummarizeResponse summary = aiService.summarizeConversation(request.getMessages());
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/check-message")
    @Operation(summary = "Analyze message for spam, scam, phishing, or malicious links")
    public ResponseEntity<SecurityCheckResponse> checkSecurity(@Valid @RequestBody SecurityCheckRequest request) {
        SecurityCheckResponse check = aiService.detectSuspiciousContent(request.getText());
        return ResponseEntity.ok(check);
    }
}
