// LOST AND FOUND - Storage layer (local prototype state & initial mock seed)
import { CONFIG } from './config.js';

const SEED_REPORTS = [
  {
    id: "rep-001",
    user_id: "demo-user-1",
    user_name: "Sarah Jenkins",
    report_type: "found",
    item_name: "Black Leather Bi-Fold Wallet",
    category: "Wallets",
    description: "Found a genuine black leather wallet on the 2nd floor reading table in the Library. Contains college library card and loose change.",
    image_urls: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"],
    location: "Library",
    date_lost_or_found: "2026-10-18",
    approximate_time: "14:30",
    custody_status: "Currently with me",
    status: "Active",
    created_at: "2026-10-18T15:00:00Z"
  },
  {
    id: "rep-002",
    user_id: "demo-user-2",
    user_name: "Alex Rivera",
    report_type: "lost",
    item_name: "Black Slim Leather Wallet",
    category: "Wallets",
    description: "Lost my black leather wallet during afternoon study session in the library. Very urgent!",
    image_urls: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"],
    location: "Library",
    date_lost_or_found: "2026-10-18",
    approximate_time: "14:00",
    custody_status: null,
    status: "Active",
    created_at: "2026-10-18T16:30:00Z"
  },
  {
    id: "rep-003",
    user_id: "demo-user-current",
    user_name: "David Chen",
    report_type: "lost",
    item_name: "Matte Blue Hydro Flask Water Bottle",
    category: "Water Bottles",
    description: "Lost a 750ml blue metal water bottle with a small campus sticker near Classroom Block B room 204.",
    image_urls: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"],
    location: "Classroom",
    date_lost_or_found: "2026-10-19",
    approximate_time: "11:15",
    custody_status: null,
    status: "Active",
    created_at: "2026-10-19T12:00:00Z"
  },
  {
    id: "rep-004",
    user_id: "demo-user-3",
    user_name: "Priya Sharma",
    report_type: "found",
    item_name: "White Wireless Earbuds Case",
    category: "Electronics",
    description: "Found white charging case with earbuds inside left on the cafeteria corner booth.",
    image_urls: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"],
    location: "Canteen",
    date_lost_or_found: "2026-10-19",
    approximate_time: "13:45",
    custody_status: "Submitted to the lost-property desk",
    status: "Active",
    created_at: "2026-10-19T14:15:00Z"
  },
  {
    id: "rep-005",
    user_id: "demo-user-4",
    user_name: "Marcus Vance",
    report_type: "lost",
    item_name: "College ID Card - Student Badge",
    category: "ID Cards",
    description: "Lost student ID card with blue lanyard near the main Auditorium stairs after assembly.",
    image_urls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"],
    location: "Auditorium",
    date_lost_or_found: "2026-10-17",
    approximate_time: "16:00",
    custody_status: null,
    status: "Active",
    created_at: "2026-10-17T17:00:00Z"
  },
  {
    id: "rep-006",
    user_id: "demo-user-5",
    user_name: "Elena Rostova",
    report_type: "found",
    item_name: "65W USB-C Laptop Charger",
    category: "Electronics",
    description: "Black Dell USB-C laptop power adapter found plugged in at Computer Lab 3.",
    image_urls: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80"],
    location: "Laboratory",
    date_lost_or_found: "2026-10-18",
    approximate_time: "17:30",
    custody_status: "Currently with me",
    status: "Active",
    created_at: "2026-10-18T18:00:00Z"
  },
  {
    id: "rep-007",
    user_id: "demo-user-current",
    user_name: "David Chen",
    report_type: "found",
    item_name: "Spiral Math Notebook & Formulas",
    category: "Books and Notes",
    description: "Found a blue spiral bound notebook containing calculus formulas on Library 1st floor desk.",
    image_urls: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"],
    location: "Library",
    date_lost_or_found: "2026-10-19",
    approximate_time: "16:20",
    custody_status: "Currently with me",
    status: "Active",
    created_at: "2026-10-19T17:00:00Z"
  },
  {
    id: "rep-008",
    user_id: "demo-user-6",
    user_name: "Liam O'Connor",
    report_type: "found",
    item_name: "Navy Blue Sports Backpack",
    category: "Bags",
    description: "Found near sports ground spectator benches after football practice. Contains gym gear.",
    image_urls: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"],
    location: "Sports Ground",
    date_lost_or_found: "2026-10-16",
    approximate_time: "18:30",
    custody_status: "Handed over to campus security",
    status: "Returned",
    created_at: "2026-10-16T19:00:00Z"
  }
];

export const StorageService = {
  init() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) {
      // Seed an initial demo conversation
      const initialConvos = [
        {
          id: "convo-seed-1",
          item_report_id: "rep-001",
          participant_one_id: "demo-user-current",
          participant_two_id: "demo-user-1",
          participant_two_name: "Sarah Jenkins",
          status: "active",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          expires_at: new Date(Date.now() + 3600000 * 22).toISOString()
        }
      ];
      localStorage.setItem(CONFIG.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(initialConvos));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES)) {
      const initialMsgs = [
        {
          id: "msg-001",
          conversation_id: "convo-seed-1",
          sender_id: "demo-user-1",
          sender_name: "Sarah Jenkins",
          message_text: "Hi David! Did you lose a black leather wallet in the library?",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "msg-002",
          conversation_id: "convo-seed-1",
          sender_id: "demo-user-current",
          sender_name: "David Chen",
          message_text: "Hello! Yes, I was studying there on the 2nd floor yesterday afternoon. Does it have a student ID?",
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(initialMsgs));
    }
  },

  getReports() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.REPORTS)) || [];
    } catch {
      return SEED_REPORTS;
    }
  },

  getReportById(id) {
    const reports = this.getReports();
    return reports.find(r => r.id === id) || null;
  },

  saveReport(report) {
    const reports = this.getReports();
    const existingIndex = reports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      reports[existingIndex] = { ...reports[existingIndex], ...report, updated_at: new Date().toISOString() };
    } else {
      reports.unshift({
        ...report,
        id: report.id || `rep-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: report.status || "Active"
      });
    }
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return report;
  },

  deleteReport(id, currentUserId) {
    let reports = this.getReports();
    const rep = reports.find(r => r.id === id);
    if (!rep) throw new Error("Report not found");
    if (rep.user_id !== currentUserId) throw new Error("Unauthorized to delete this report");

    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return true;
  },

  resolveReport(id, currentUserId) {
    const reports = this.getReports();
    const rep = reports.find(r => r.id === id);
    if (!rep) throw new Error("Report not found");
    if (rep.user_id !== currentUserId) throw new Error("Unauthorized: you do not own this report");

    rep.status = "Resolved";
    rep.resolved_at = new Date().toISOString();
    localStorage.setItem(CONFIG.STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    return rep;
  },

  // Conversations
  getConversations(userId) {
    this.init();
    this.cleanupInactiveConversations();
    try {
      const convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
      return convos.filter(c => (c.participant_one_id === userId || c.participant_two_id === userId) && c.status === "active");
    } catch {
      return [];
    }
  },

  getConversationById(convoId, userId) {
    this.init();
    this.cleanupInactiveConversations();
    const convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
    const convo = convos.find(c => c.id === convoId);
    if (!convo) return null;
    if (convo.participant_one_id !== userId && convo.participant_two_id !== userId) {
      throw new Error("Unauthorized access to conversation");
    }
    return convo;
  },

  createOrGetConversation(reportId, participantOneId, participantTwoId, participantTwoName) {
    this.init();
    const convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
    let existing = convos.find(c => 
      c.item_report_id === reportId &&
      ((c.participant_one_id === participantOneId && c.participant_two_id === participantTwoId) ||
       (c.participant_one_id === participantTwoId && c.participant_two_id === participantOneId)) &&
      c.status === "active"
    );

    if (existing) return existing;

    const newConvo = {
      id: `convo-${Date.now()}`,
      item_report_id: reportId,
      participant_one_id: participantOneId,
      participant_two_id: participantTwoId,
      participant_two_name: participantTwoName || "Student Finder",
      status: "active",
      created_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (CONFIG.CHAT_INACTIVITY_HOURS * 3600000)).toISOString()
    };

    convos.unshift(newConvo);
    localStorage.setItem(CONFIG.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    return newConvo;
  },

  // Messages
  getMessages(convoId, userId) {
    const convo = this.getConversationById(convoId, userId);
    if (!convo || convo.status !== "active") return [];
    try {
      const msgs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES)) || [];
      return msgs.filter(m => m.conversation_id === convoId);
    } catch {
      return [];
    }
  },

  sendMessage(convoId, senderId, senderName, text) {
    const convo = this.getConversationById(convoId, senderId);
    if (!convo) throw new Error("Conversation not found");
    if (convo.status !== "active") throw new Error("Cannot message on an ended or expired conversation");

    const newMsg = {
      id: `msg-${Date.now()}`,
      conversation_id: convoId,
      sender_id: senderId,
      sender_name: senderName,
      message_text: text,
      created_at: new Date().toISOString()
    };

    const msgs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES)) || [];
    msgs.push(newMsg);
    localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));

    // Update conversation last_message_at and refresh expiration
    const convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
    const idx = convos.findIndex(c => c.id === convoId);
    if (idx >= 0) {
      convos[idx].last_message_at = new Date().toISOString();
      convos[idx].expires_at = new Date(Date.now() + (CONFIG.CHAT_INACTIVITY_HOURS * 3600000)).toISOString();
      localStorage.setItem(CONFIG.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    }

    return newMsg;
  },

  // END CHAT & PERMANENT ACTIVE DELETION
  endAndPermanentDeleteChat(convoId, userId) {
    const convo = this.getConversationById(convoId, userId);
    if (!convo) throw new Error("Conversation not found or unauthorized");

    // 1. Delete all messages for this conversation permanently from storage
    let msgs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES)) || [];
    msgs = msgs.filter(m => m.conversation_id !== convoId);
    localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));

    // 2. Mark conversation as ended and clear active state
    let convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
    const idx = convos.findIndex(c => c.id === convoId);
    if (idx >= 0) {
      convos[idx].status = "ended";
      convos[idx].ended_at = new Date().toISOString();
      localStorage.setItem(CONFIG.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
    }

    return true;
  },

  // Cleanup inactive chats (24h period)
  cleanupInactiveConversations() {
    try {
      const convos = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.CONVERSATIONS)) || [];
      const now = new Date().getTime();
      let updated = false;

      convos.forEach(c => {
        if (c.status === "active" && c.expires_at) {
          if (new Date(c.expires_at).getTime() < now) {
            c.status = "expired";
            c.ended_at = new Date().toISOString();
            updated = true;

            // Delete expired messages permanently
            let msgs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.MESSAGES)) || [];
            msgs = msgs.filter(m => m.conversation_id !== c.id);
            localStorage.setItem(CONFIG.STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
          }
        }
      });

      if (updated) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CONVERSATIONS, JSON.stringify(convos));
      }
    } catch (err) {
      console.warn("Inactivity cleanup failed", err);
    }
  }
};
