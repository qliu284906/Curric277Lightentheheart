
import { User, SignupSource } from './types';

// --- CONFIGURATION ---

/**
 * ==========================================
 *  GOOGLE SHEETS BACKEND SETUP INSTRUCTIONS
 * ==========================================
 * 
 * 1. Create a new Google Sheet at https://sheets.new
 * 2. (Optional) In row 1, type headers: "Name" | "Time" | "ID" | "Label"
 * 3. Go to Extensions > Apps Script
 * 4. Paste the following code into Code.gs:
 * 
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      // Appends: Name, Server Date, ID, Label (e.g. "Guest" or "Week 12")
 *      sheet.appendRow([data.name, new Date(), data.id, data.label]);
 *      return ContentService.createTextOutput(JSON.stringify({'result': 'success'})).setMimeType(ContentService.MimeType.JSON);
 *    }
 * 
 * 5. Click "Deploy" > "New Deployment"
 * 6. Select type: "Web app"
 * 7. Set "Who has access" to "Anyone" (IMPORTANT!)
 * 8. Click "Deploy" and copy the "Web App URL"
 * 9. Paste the URL below in GOOGLE_APPS_SCRIPT_URL
 */

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"
export const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby0FRjmrxvaf6wTOjJQz_xls7CQebd2gyX_eN8nfildNI61mS7fvgSJedlPhfW0OUCq/exec"; 

// X represents a pixel, spaces are empty
// A larger 9x7 heart mask with exactly 38 pixels
export const HEART_MASK = [
  " XX   XX ", // 4
  "XXXXXXXXX", // 9
  "XXXXXXXXX", // 9
  " XXXXXXX ", // 7
  "  XXXXX  ", // 5
  "   XXX   ", // 3
  "    X    ", // 1
];

export const TOTAL_CAPACITY = HEART_MASK.reduce((acc, row) => acc + (row.match(/X/g) || []).length, 0);

export const SEMESTER_THANK_YOU_MESSAGES = [
  "Your dedication and enthusiasm this semester have truly brightened our class.",
  "Thank you for your hard work and the positive energy you brought to every session.",
  "We appreciate your wonderful contributions and the effort you put into this semester.",
  "Your unique perspective and consistent participation made a real difference.",
  "Thank you for being such a valuable part of our community this term.",
  "Your growth and cooperation throughout the semester have been inspiring to watch.",
  "We are so grateful for your engagement and the creativity you shared with us.",
  "Thank you for your commitment and for making this semester memorable for everyone.",
  "Your thoughtful contributions and support have been a gift to the class.",
  "We really appreciate your cooperation and the hard work you invested this semester."
];

// 2. Pending Users (Unlit / From your CSV table)
// 19 Students
export const PENDING_STUDENTS: User[] = [
  { id: 'pen-1', name: 'Asa Wold', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-2', name: 'Raymond Lu', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-3', name: 'Qin Liu', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-4', name: 'Haoran WANG', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-5', name: 'Shaofeng Sun', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-6', name: 'Yixin WANG', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-7', name: 'Felix Zhu', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-8', name: 'Linyan Li', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-9', name: 'Matt Bai', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-10', name: 'Amy Cai', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-11', name: 'Wonju Yoo', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-12', name: 'Shuaizhi Chen', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-13', name: 'Habeeb Afolabi', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-14', name: 'Alina Zhang', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-15', name: 'Arjun Sahlot', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-16', name: 'Ary Saini', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-17', name: 'Junjie Yan', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-18', name: 'Fabian Clarke', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
  { id: 'pen-19', name: 'Evelyn PAN', source: SignupSource.PENDING, timestamp: Date.now(), label: 'Presenter', isLit: false },
];

// 1. Existing Users (Already Lit)
// Total Capacity is 38. Pending is 19. Available slots = 19.
export const INITIAL_LEGACY_USERS: User[] = [
  { id: 'leg-3', name: 'Amy', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 3', isLit: true },
  { id: 'leg-4', name: 'Haoran Wang', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 3', isLit: true },
  { id: 'leg-5', name: 'Qian Liu', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 4', isLit: true },
  { id: 'leg-6', name: 'Habeeb', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 5', isLit: true },
  { id: 'leg-7', name: 'Alina Zhang', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 5', isLit: true },
  { id: 'leg-8', name: 'Qian Liu', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 6', isLit: true },
  { id: 'leg-9', name: 'Linyan Li', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 7', isLit: true },
  { id: 'leg-10', name: 'Fabian', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 7', isLit: true },
  { id: 'leg-11', name: 'Arjun', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 7', isLit: true },
  { id: 'leg-12', name: 'Qin Liu', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 8', isLit: true },
  { id: 'leg-13', name: 'Junjie Yan', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 8', isLit: true },
  { id: 'leg-14', name: 'Shuaizhi Chen', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 9', isLit: true },
  { id: 'leg-15', name: 'Matt Bai', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 9', isLit: true },
  { id: 'leg-16', name: 'Wonju Yoo', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 9', isLit: true },
  { id: 'leg-17', name: 'Evelyn Pan', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 12', isLit: true },
  { id: 'leg-18', name: 'Shaofeng', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 12', isLit: true },
  { id: 'leg-19', name: 'Asa Wold', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 12', isLit: true },
  { id: 'leg-20', name: 'Ary', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 14', isLit: true },
  { id: 'leg-21', name: 'Yixin Wang', source: SignupSource.LEGACY, timestamp: Date.now(), label: 'Week 14', isLit: true },
];
