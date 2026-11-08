// CONFIGURATION
const CONFIG = {
  SHEET_NAME: "emp_database", 
  WEB_APP_TITLE: "Employee Demographic Dashboard",
  HTML_FILE_NAME: "WebApp_Demographic"
};

// [EXPLANATION] This maps spreadsheet column numbers (starting at 0 for Column A) to readable variables
const COL = {
  status:               0,   
  userId:               1,   
  candidateId:          2,   
  employeeId:           3,   
  fullName:             4,   
  organization:         5,   
  subDepartment:        6,   
  project:              7,   
  position:             8,   
  jobLevel:             9,   
  joinDate:             10,  
  resignDate:           11,  
  statusEmployee:       12,  
  endDate:              13,  
  email:                14,  
  birthDate:            15,  
  birthPlace:           16,  
  citizenAddress:       17,  
  residentialAddress:   18,  
  nik:                  19,  
  mobilePhone:          20,  
  branchName:           21,  
  customLocation:       22,  
  religion:             23,  
  gender:               24,  
  maritalStatus:        25,  
  bloodType:            26,  
  lengthOfService:      27,  
  approvalLine:         28,  
  managerName:          29,  
  managerEmail:         30,  
  grade:                31,  
  profilePicture:       32,  
  customGroup1:         33,  
  customGroup2:         34,  
  legalEntity:          35,  
  company:              36,  
  resignReason:         37,  
  resignReasonDetail:   38,  
};

// [EXPLANATION] Keywords used to determine if an employee is active or inactive based on their status text
const INACTIVE_STATUS = [
  "resign", "resigned", "inactive", "terminated",
  "non-active", "nonactive", "off", "left", 
  "dummy", "dummy contract", "dummy probation"
];

const ACTIVE_STATUS = [
  "active", "contract", "permanent", "freelance",
  "internship", "outsource", "probation",
  "pkwt", "pkwtt"
];

// [EXPLANATION] Entry point for the Google Web App. Renders HTML or spits out JSON if testing via URL params.
function doGet(e) {
  Logger.log("doGet initialized.");
  if (e && e.parameter && e.parameter.data === '1') {
    Logger.log("Returning JSON data due to parameter ?data=1");
    return ContentService
      .createTextOutput(JSON.stringify(getData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile(CONFIG.HTML_FILE_NAME)
    .setTitle(CONFIG.WEB_APP_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// [EXPLANATION] Main backend data fetcher. Reads the spreadsheet and parses rows.
function getData() {
  Logger.log("getData() called. Attempting to fetch spreadsheet.");
  try {
    const ss = SpreadsheetApp.openById("1k-VsQKOpqRmac3UkA8NKsgni8N7G3M4H8NwViruBL0I");
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      const available = ss.getSheets().map(s => s.getName()).join(", ");
      Logger.log(`Error: Sheet ${CONFIG.SHEET_NAME} missing.`);
      return { error: `Sheet "${CONFIG.SHEET_NAME}" not found. Available sheets: ${available}` };
    }

    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) {
      Logger.log("Sheet is empty or has only headers.");
      return { error: "Sheet is empty." };
    }

    Logger.log(`Fetched ${rows.length} rows.`);
    const headers   = rows[0].map(h => String(h).trim());
    const employees = [];

    // [EXPLANATION] Loop through all rows skipping the header (index 0)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.every(c => String(c).trim() === "")) continue; // Skip entirely blank rows
      employees.push(parseRow(row));
    }

    const uniqueStatuses      = [...new Set(employees.map(e => e.statusEmployee))].filter(Boolean).sort();
    const uniqueContractTypes = [...new Set(employees.map(e => e.contractType))].filter(Boolean).sort();
    const summary             = buildSummary(employees);

    Logger.log(`Processed ${employees.length} valid employees.`);
    
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
    Logger.log(`[FATAL ERROR] ${err.message}`);
    return { error: err.message, stack: err.stack };
  }
}

// [EXPLANATION] Transforms raw spreadsheet array into a clean object with logic applied
function parseRow(row) {
  const g = col => String(row[col] ?? "").trim();

  const statusA        = g(COL.status);
  const statusEmployee = g(COL.statusEmployee);
  const contractType   = statusEmployee;
  const statusLow      = statusA.toLowerCase();

  let isActive;
  // [EXPLANATION] Logic checks to identify active vs resigned employees
  if (INACTIVE_STATUS.some(v => statusLow.includes(v))) {
    isActive = false;
  } else if (ACTIVE_STATUS.some(v => statusLow.includes(v))) {
    isActive = true;
  } else {
    // If not matching keywords, default to active if name exists and resign date is empty
    isActive = g(COL.fullName).length > 0 && g(COL.resignDate) === "";
  }

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

  let los = g(COL.lengthOfService), losGroup = "Unknown";
  const jd = parseDate(row[COL.joinDate]);
  const joinDateStr = jd ? jd.toISOString().split("T")[0] : g(COL.joinDate);
  if (jd) {
    const yrs = (Date.now() - jd.getTime()) / (365.25 * 24 * 3600 * 1000);
    if (!los) los = yrs.toFixed(1);
    losGroup = yrs < 1  ? "< 1 year"
             : yrs < 3  ? "1–3 years"
             : yrs < 5  ? "3–5 years"
             : yrs < 10 ? "5–10 years"
             : "> 10 years";
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

// [EXPLANATION] Safely attempts to parse various date formats from the spreadsheet
function parseDate(raw) {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date) return isNaN(raw) ? null : raw;
  if (typeof raw === "number") {
    // Handling Excel/Google Sheets serial date format
    const d = new Date((raw - 25569) * 86400000);
    return isNaN(d) ? null : d;
  }
  const s = String(raw).trim();
  let d = new Date(s);
  if (!isNaN(d)) return d;
  // Fallback for custom DD/MM/YYYY format parsing
  const m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

// [EXPLANATION] Groups various gender inputs from source into a strict standard format
function normalizeGender(raw) {
  const l = raw.toLowerCase();
  // Catches both English and Indonesian variations inside the spreadsheet dataset
  if (l === "f" || /wanita|perempuan|female/.test(l)) return "Female";
  if (l === "m" || /laki|pria|male/.test(l))          return "Male";
  return raw || "Unknown";
}

function buildSummary(employees) {
  const active   = employees.filter(e => e.isActive);
  const resigned = employees.filter(e => !e.isActive);

  // Group by function helper to tally unique attributes 
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
