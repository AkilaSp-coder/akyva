package com.akyva;

import com.akyva.ai.MockAiService;
import com.akyva.dto.ai.SecurityCheckResponse;
import com.akyva.dto.ai.SummarizeResponse;
import com.akyva.entity.enums.RiskLevel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AiServiceTest {

    private MockAiService mockAiService;

    @BeforeEach
    void setUp() {
        mockAiService = new MockAiService();
    }

    @Test
    @DisplayName("Should generate contextual smart reply suggestions")
    void testSmartReplies() {
        List<String> replies = mockAiService.generateReplySuggestions("Can you share the report?", List.of());
        assertNotNull(replies);
        assertFalse(replies.isEmpty());
        assertTrue(replies.size() <= 4);
    }

    @Test
    @DisplayName("Should translate sample phrases to Tamil and Hindi")
    void testTranslation() {
        String tamilTranslation = mockAiService.translateMessage("How are you?", "en", "tamil");
        assertEquals("நீங்கள் எப்படி இருக்கிறீர்கள்?", tamilTranslation);

        String hindiTranslation = mockAiService.translateMessage("Hello", "en", "hindi");
        assertEquals("नमस्ते", hindiTranslation);
    }

    @Test
    @DisplayName("Should rewrite message into Professional and Friendly styles")
    void testRewriteMessage() {
        String original = "we need to talk about the budget";
        String professional = mockAiService.rewriteMessage(original, "Professional");
        assertTrue(professional.toLowerCase().contains("good day") || professional.toLowerCase().contains("confirm"));

        String friendly = mockAiService.rewriteMessage(original, "Friendly");
        assertTrue(friendly.contains("😊") || friendly.toLowerCase().contains("hey"));
    }

    @Test
    @DisplayName("Should detect high-risk scam or phishing content")
    void testSecurityCheck() {
        String scamText = "URGENT: Please send money via wire transfer right now to claim your prize! Visit http://bit.ly/claim-funds";
        SecurityCheckResponse check = mockAiService.detectSuspiciousContent(scamText);

        assertEquals(RiskLevel.HIGH, check.getRiskLevel());
        assertTrue(check.isSuspicious());
        assertNotNull(check.getRecommendedAction());

        SecurityCheckResponse safeCheck = mockAiService.detectSuspiciousContent("Hi Sarah, looking forward to our meeting tomorrow!");
        assertEquals(RiskLevel.LOW, safeCheck.getRiskLevel());
        assertFalse(safeCheck.isSuspicious());
    }

    @Test
    @DisplayName("Should summarize conversation with action items")
    void testSummarize() {
        SummarizeResponse summary = mockAiService.summarizeConversation(List.of("Meeting on Friday", "Arun prepares docs", "Priya reviews"));
        assertNotNull(summary.getOverview());
        assertFalse(summary.getKeyPoints().isEmpty());
        assertFalse(summary.getActionItems().isEmpty());
    }
}
