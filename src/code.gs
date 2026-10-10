// ============================================================
// EMPLOYEE DEMOGRAPHIC DASHBOARD - Google Apps Script
// ============================================================

// CONFIGURATION - Change these values to match your sheet setup
const CONFIG = {
  SHEET_NAME: "YOUR_SHEET_NAME_HERE", // e.g. "Employee Database"
  WEB_APP_TITLE: "Employee Demographic Dashboard",
  HTML_FILE_NAME: "WebApp Demographic"
};

// Column Mapping Index (0-based: A=0, B=1, C=2, etc.)
const COL = {
  status:               0,   // A  - Status (Active/Inactive)
  userId:               1,   // B  - User ID
  candidateId:          2,   // C  - Candidate ID
  employeeId:           3,   // D  - Employee ID
  fullName:             4,   // E  - Full Name
  organization:         5,   // F  - Organization / Department
  subDepartment:        6,   // G  - Sub-Department
  project:              7,   // H  - Project
  position:             8,   // I  - Position
  jobLevel:             9,   // J  - Job Level
  joinDate:             10,  // K  - Join Date
  resignDate:           11,  // L  - Resign Date
  statusEmployee:       12,  // M  - Status Employee / Employment Type
  endDate:              13,  // N  - End Date
  email:                14,  // O  - Email
  birthDate:            15,  // P  - Birth Date
  birthPlace:           16,  // Q  - Birth Place
  citizenAddress:       17,  // R  - Citizen ID Address
  residentialAddress:   18,  // S  - Residential Address
  nik:                  19,  // T  - NIK / ID Number
  mobilePhone:          20,  // U  - Mobile Phone
  branchName:           21,  // V  - Branch Name
  customLocation:       22,  // W  - Location / Worksite
  religion:             23,  // X  - Religion
  gender:               24,  // Y  - Gender
  maritalStatus:        25,  // Z  - Marital Status
  bloodType:            26,  // AA - Blood Type
  lengthOfService:      27,  // AB - Length Of Service
  approvalLine:         28,  // AC - Approval Line
  managerName:          29,  // AD - Manager Name
  managerEmail:         30,  // AE - Manager Email
  grade:                31,  // AF - Grade
  profilePicture:       32,  // AG - Profile Picture URL
  customGroup1:         33,  // AH - Custom Field 1
  customGroup2:         34,  // AI - Custom Field 2
  legalEntity:          35,  // AJ - Legal Entity
  company:              36,  // AK - Company
  resignReason:         37,  // AL - Resignation Reason
  resignReasonDetail:   38,  // AM - Resignation Reason Detail
};

// Filter Keywords
const INACTIVE_STATUS = [
  "resign", "resigned", "inactive", "terminated",
  "non-active", "nonactive", "tidak aktif", "off", "keluar",
  "dummy", "dummy contract", "dummy probation"
];

const ACTIVE_STATUS = [
  "aktif", "active",
  "contract", "permanent", "freelance",
  "internship", "outsource", "probation",
  "pkwt", "pkwtt"
];

// ── doGet: serve HTML dashboard or JSON data ──
function doGet(e) {
  if (e && e.parameter && e.parameter.data === '1') {
    return ContentService
      .createTextOutput(JSON.stringify(getData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile(CONFIG.HTML_FILE_NAME)
    .setTitle(CONFIG.WEB_APP_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── getData: Called via google.script.run.getData() ──
function getData() {
  try {
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      const available = ss.getSheets().map(s => s.getName()).join(", ");
      return { error: `Sheet "${CONFIG.SHEET_NAME}" not found. Available sheets: ${available}` };
    }

    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return { error: "Sheet is empty." };

    const headers   = rows[0].map(h => String(h).trim());
    const employees = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.every(c => String(c).trim() === "")) continue;
      employees.push(parseRow(row));
    }

    const uniqueStatuses      = [...new Set(employees.map(e => e.statusEmployee))].filter(Boolean).sort();
    const uniqueContractTypes = [...new Set(employees.map(e => e.contractType))].filter(Boolean).sort();
    const summary             = buildSummary(employees);

    return {
      success:     true,
      lastUpdated: new Date().toISOString(),
      totalRows:   employees.length,
      debug: {
        headerCheck: {
          colA_status:     headers[COL.status],
          colM_statusEmp:  headers[COL.statusEmployee],
          colL_resignDate: headers[COL.resignDate],
        },
        uniqueStatuses,
        uniqueContractTypes,
        activeCount:   summary.active,
        resignedCount: summary.resigned,
      },
      summary,
      employees: employees.map(e => ({
        id:             e.employeeId,
        name:           e.fullName,
        department:     e.organization,
        subDept:        e.subDepartment,
        project:        e.project,
        position:       e.position,
        jobLevel:       e.jobLevel,
        grade:          e.grade,
        gender:         e.gender,
        religion:       e.religion,
        maritalStatus:  e.maritalStatus,
        age:            e.age,
        ageGroup:       e.ageGroup,
        los:            e.los,
        losGroup:       e.losGroup,
        joinDate:       e.joinDate,
        resignDate:     e.resignDate,
        status:         e.statusEmployee,
        contractType:   e.contractType,
        branch:         e.branchName,
        location:       e.customLocation,
        legalEntity:    e.legalEntity,
        company:        e.company,
        resignReason:   e.resignReason,
        isActive:       e.isActive,
      }))
    };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

function parseRow(row) {
  const g = col => String(row[col] ?? "").trim();

  const statusA        = g(COL.status);
  const statusEmployee = g(COL.statusEmployee);
  const contractType   = statusEmployee;
  const statusLow      = statusA.toLowerCase();

  let isActive;
  if (INACTIVE_STATUS.some(v => statusLow.includes(v))) {
    isActive = false;
  } else if (ACTIVE_STATUS.some(v => statusLow.includes(v))) {
    isActive = true;
  } else {
    isActive = g(COL.fullName).length > 0 && g(COL.resignDate) === "";
  }

  // Age calculation
  let age = null, ageGroup = "Unknown";
  const bd = parseDate(row[COL.birthDate]);
  if (bd) {
    age = Math.floor((Date.now() - bd.getTime()) / (365.25 * 24 * 3600 * 1000));
    ageGroup = age < 25 ? "< 25"
             : age <= 30 ? "25–30"
             : age <= 35 ? "31–35"
             : age <= 40 ? "36–40"
             : age <= 45 ? "41–45"
             : "> 45";
  }

  // Length of Service (LoS) calculation
  let los = g(COL.lengthOfService), losGroup = "Unknown";
  const jd = parseDate(row[COL.joinDate]);
  const joinDateStr = jd ? jd.toISOString().split("T")[0] : g(COL.joinDate);
  if (jd) {
    const yrs = (Date.now() - jd.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (!los) los = yrs.toFixed(1);
    losGroup = yrs < 1  ? "< 1 tahun"
             : yrs < 3  ? "1–3 tahun"
             : yrs < 5  ? "3–5 tahun"
             : yrs < 10 ? "5–10 tahun"
             : "> 10 tahun";
  }

  const rd = parseDate(row[COL.resignDate]);
  const resignDateStr = rd ? rd.toISOString().split("T")[0] : g(COL.resignDate);

  return {
    employeeId:     g(COL.employeeId) || g(COL.userId),
    fullName:       g(COL.fullName),
    organization:   g(COL.organization)   || "Unknown",
    subDepartment:  g(COL.subDepartment)  || "Unknown",
    project:        g(COL.project)        || "Unknown",
    position:       g(COL.position)       || "Unknown",
    jobLevel:       g(COL.jobLevel)       || "Unknown",
    grade:          g(COL.grade)          || "Unknown",
    gender:         normalizeGender(g(COL.gender)),
    religion:       g(COL.religion)       || "Unknown",
    maritalStatus:  g(COL.maritalStatus)  || "Unknown",
    age, ageGroup,
    joinDate:       joinDateStr,
    resignDate:     resignDateStr,
    los, losGroup,
    statusEmployee: statusEmployee        || "Unknown",
    contractType:   contractType          || "Unknown",
    isActive,
    branchName:     g(COL.branchName)     || "Unknown",
    customLocation: g(COL.customLocation) || "Unknown",
    legalEntity:    g(COL.legalEntity)    || "Unknown",
    company:        g(COL.company)        || "Unknown",
    resignReason:   g(COL.resignReason),
  };
}

function parseDate(raw) {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date) return isNaN(raw) ? null : raw;
  if (typeof raw === "number") {
    const d = new Date((raw - 25569) * 86400000);
    return isNaN(d) ? null : d;
  }
  const s = String(raw).trim();
  let d = new Date(s);
  if (!isNaN(d)) return d;
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

function normalizeGender(raw) {
  const l = raw.toLowerCase();
  if (l === "f" || /wanita|perempuan|female/.test(l)) return "Perempuan";
  if (l === "m" || /laki|pria|male/.test(l))          return "Laki-laki";
  return raw || "Unknown";
}

function buildSummary(employees) {
  const active   = employees.filter(e => e.isActive);
  const resigned = employees.filter(e => !e.isActive);

  const gb = (arr, key) => {
    const r = {};
    arr.forEach(e => {
      const v = String(e[key] || "Unknown").trim() || "Unknown";
      r[v] = (r[v] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(r).sort((a, b) => b[1] - a[1]));
  };

  const avg = arr => arr.length
    ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
    : 0;

  return {
    total:           employees.length,
    active:          active.length,
    resigned:        resigned.length,
    byGender:        gb(active,   "gender"),
    byDepartment:    gb(active,   "organization"),
    bySubDept:       gb(active,   "subDepartment"),
    byJobLevel:      gb(active,   "jobLevel"),
    byGrade:         gb(active,   "grade"),
    byAgeGroup:      gb(active,   "ageGroup"),
    byLoS:           gb(active,   "losGroup"),
    byReligion:      gb(active,   "religion"),
    byMaritalStatus: gb(active,   "maritalStatus"),
    byBranch:        gb(active,   "branchName"),
    byLocation:      gb(active,   "customLocation"),
    byLegalEntity:   gb(employees,"legalEntity"),
    company:         gb(employees,"company"),
    byStatus:        gb(employees,"statusEmployee"),
    byContractType:  gb(active,   "contractType"),
    byResignReason:  gb(resigned.filter(e => e.resignReason), "resignReason"),
    avgAge:          avg(active.map(e => e.age).filter(v => v !== null)),
    avgLoS:          avg(active.map(e => parseFloat(e.los)).filter(v => !isNaN(v))),
  };
}
