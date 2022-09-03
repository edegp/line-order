import { store, setLineUser, setAxiosError } from "store";
import { isIOS, isAndroid } from "react-device-detect";

export const ocopy = (obj: any) => {
  let ret = null;
  if (obj != null) {
    ret = JSON.parse(JSON.stringify(obj));
  }
  return ret;
};

export const weekdayName = (weekday: string) => {
  let name = "";
  const { t } = store.getState();
  if (t)
    switch (parseInt(weekday, 10)) {
      case 0:
        name = t.utils.sun;
        break;
      case 1:
        name = t.utils.mon;
        break;
      case 2:
        name = t.utils.tue;
        break;
      case 3:
        name = t.utils.wed;
        break;
      case 4:
        name = t.utils.thu;
        break;
      case 5:
        name = t.utils.fri;
        break;
      case 6:
        name = t.utils.sat;
        break;
    }

  return name;
};

export const openMapApp = (
  latitude: any,
  longitude: any,
  zoom: any,
  markered = true
) => {
  let params = `ll=${latitude},${longitude}&z=${zoom}`;
  if (markered) {
    params += `&q=${latitude},${longitude}`;
  }
  import("@line/liff").then((liff) => {
    if (isIOS) {
      liff.default.openWindow({
        url: `https://maps.apple.com/maps?${params}`,
        external: true,
      });
    } else if (isAndroid) {
      liff.default.openWindow({
        url: `https://maps.google.com/maps?${params}`,
        external: true,
      });
    } else {
      window.open(`https://maps.google.com/maps?${params}`, "_blank");
    }
  });
};

export const convertWeekdays = (weekdays: any) => {
  let ret = [];
  for (let weekday of weekdays) {
    switch (weekday) {
      case 0:
        ret.push(-1);
        break; // 休日なし
      case 1:
        ret.push(1);
        break; // 月
      case 2:
        ret.push(2);
        break; // 火
      case 3:
        ret.push(3);
        break; // 水
      case 4:
        ret.push(4);
        break; // 木
      case 5:
        ret.push(5);
        break; // 金
      case 6:
        ret.push(6);
        break; // 土
      case 7:
        ret.push(0);
        break; // 日
      case 9:
        ret.push(9);
        break; // 祝
    }
  }

  return ret;
};

// const router = useRouter();
const liffId = process.env.LIFF_ID;

export const showHttpError = (error: any) => {
  if (error.response && error.response.status >= 400) {
    // HTTP 403 Topへ画面遷移
    if (error.response.status == 403) {
      const { t } = store.getState();
      const errmsg = t?.error.msg005;
      if (typeof window !== "undefined") window.alert(errmsg);
      store.dispatch(setLineUser(null));
      import("@line/liff").then((liff) => {
        liff.default.logout();
      });
      if (typeof window !== "undefined")
        window.location.assign(`https://liff.line.me/${liffId}`);
      return true;
    }

    const response: { data: any; status: number; statusText: string } =
      error.response;
    const message =
      !response.data && httpStatus[response.status]
        ? httpStatus[response.status].message
        : response.data;
    setTimeout(() => {
      store.dispatch(
        setAxiosError(
          `status=${response.status} ${response.statusText} ${message}`
        )
      );
    }, 500);
    return true;
  }
  return false;
};

/**
 * HTTPステータス情報
 *
 */
const httpStatus: { [key: number]: { message: string } } = {
  // Client Error
  400: { message: "Bad Request" },
  401: { message: "Unauthorized" },
  402: { message: "Payment Required" },
  403: { message: "Forbidden" },
  404: { message: "Not Found" },
  405: { message: "Method Not Allowed" },
  406: { message: "Not Acceptable" },
  407: { message: "Proxy Authentication Required" },
  408: { message: "Request Timeout" },
  409: { message: "Conflict" },
  410: { message: "Gone" },
  411: { message: "Length Required" },
  412: { message: "Precondition Failed" },
  413: { message: "Request Entity Too Large" },
  414: { message: "Request-URI Too Long" },
  415: { message: "Unsupported Media Type" },
  416: { message: "Requested Range Not Satisfiable" },
  417: { message: "Expectation Failed	Expect" },
  // Server Error
  500: { message: "Internal Server Error" },
  501: { message: "Not Implemented" },
  502: { message: "Bad Gateway" },
  503: { message: "Service Unavailable" },
  504: { message: "Gateway Timeout" },
  505: { message: "HTTP Version Not Supported" },
};

// export const monthList = (count: number) => {
//   let months = [];
//   let yyyymmdd = now("yyyymmdd");
//   let yyyy = yyyymmdd.slice(0, 4);
//   let mm = yyyymmdd.slice(4, 6).replace(/^0/, " ");
//   const { t } = store.getState();
//   if (t.type === "en") {
//     mm = englishMonth(mm);
//   }
//   months.push({
//     text: t?.restaurant.yyyymm.replace("{year}", yyyy).replace("{month}", mm),
//     value: `${yyyymmdd.substr(0, 6)}`,
//   });

//   for (let i = 0; i < count; i++) {
//     yyyymmdd = now("yyyymmdd", i + 1);
//     yyyy = yyyymmdd.substr(0, 4);
//     mm = yyyymmdd.substr(4, 2).replace(/^0/, " ");
//     if (t.type == "en") {
//       mm = englishMonth(mm);
//     }
//     months.push({
//       text: t.restaurant.yyyymm.replace("{year}", yyyy).replace("{month}", mm),
//       value: `${yyyymmdd.substr(0, 6)}`,
//     });
//   }

//   return months;
// };

export const now = (format: string, addMonths?: number | undefined) => {
  let date = new Date();
  if (typeof addMonths == "number") {
    // 月末日処理
    const endDayOfMonth = new Date(
      date.getFullYear(),
      date.getMonth() + addMonths + 1,
      0
    );
    date.setMonth(date.getMonth() + addMonths);
    if (date.getTime() > endDayOfMonth.getTime()) {
      date = endDayOfMonth;
    }
  }
  return _dateformat(date, format);
};

// const englishMonth = (month: string) => {
//   let engMonth = null;

//   switch (parseInt(month, 10)) {
//     case 1:
//       engMonth = "Jan.";
//       break; // January
//     case 2:
//       engMonth = "Feb.";
//       break; // February
//     case 3:
//       engMonth = "Mar.";
//       break; // March
//     case 4:
//       engMonth = "Apr.";
//       break; // April
//     case 5:
//       engMonth = "May.";
//       break; // May
//     case 6:
//       engMonth = "Jun.";
//       break; // June
//     case 7:
//       engMonth = "Jul.";
//       break; // July
//     case 8:
//       engMonth = "Aug.";
//       break; // August
//     case 9:
//       engMonth = "Sep.";
//       break; // September
//     case 10:
//       engMonth = "Oct.";
//       break; // October
//     case 11:
//       engMonth = "Nov.";
//       break; // November
//     case 12:
//       engMonth = "Dec.";
//       break; // December
//   }

//   return engMonth;
// };

const _dateformat = (date: Date, format: string | undefined) => {
  const yyyy = date.getFullYear();
  const mm = ("00" + (date.getMonth() + 1)).slice(-2);
  const dd = ("00" + date.getDate()).slice(-2);
  const hh = ("00" + date.getHours()).slice(-2);
  const mi = ("00" + date.getMinutes()).slice(-2);
  const ss = ("00" + date.getSeconds()).slice(-2);

  let ret = `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
  if (format !== undefined) {
    let strFormat = format.toLowerCase();
    strFormat = strFormat.replace("yyyy", yyyy.toString());
    strFormat = strFormat.replace("mm", mm);
    strFormat = strFormat.replace("dd", dd);
    strFormat = strFormat.replace("hh", hh);
    strFormat = strFormat.replace("mi", mi);
    strFormat = strFormat.replace("ss", ss);
    ret = strFormat;
  }

  return ret;
};

export const timeList = (fromTime: string, toTime: string) => {
  let ret = [];

  let ftime = parseInt(fromTime.split(":")[0], 10);
  let ttime = parseInt(toTime.split(":")[0], 10);

  for (let tm = ftime; tm <= ttime; tm++) {
    let time = ("00" + tm).slice(-2) + ":00";
    let mtime = ("00" + tm).slice(-2) + ":30";
    if (time >= fromTime) {
      ret.push({ text: time, value: time });
    }
    if (mtime <= toTime) {
      ret.push({ text: mtime, value: mtime });
    }
  }

  return ret;
};

export const createStatusRecord = () => {
  return {
    status: null,
    name: null,
    start: null,
    end: null,
    events: [],
  };
};

export function isHoliday(yyyymmdd: string, holiday: number[] | null) {
  let ret = false;
  let weekday = new Date(yyyymmdd.replace(/-/g, "/")).getDate();
  //  = date.getDay();
  if (holiday != null && holiday.length > 0 && holiday.indexOf(weekday) >= 0) {
    ret = true;
  }
  return ret;
}
