import { test, expect } from "@playwright/test";
import { sign } from "jsonwebtoken";
import {
  getDateDaysInFuture,
  getDateHoursBeforeNow,
} from "../../../utils/date";
import * as fs from "fs";

test.describe("Recordings API files Tests ", () => {
  let jwtToken;
  let getwayJwtToken;
  const buildingId = process.env.BULDING_ID;
  const cameraId = process.env.CAMERA_ID;
  const fileName = getDateHoursBeforeNow(48);

  test.beforeAll(async () => {
    const payload = {
      buildingId: buildingId,
      cameraId: cameraId,
    };

    const token = sign(payload, process.env.CLIENT_JWT_SECRET);
    const getWayToken = sign(payload, process.env.GETWAY_JWT_SECRET);
    console.log("token", token);
    console.log("buildingId", buildingId);
    console.log("cameraId", cameraId);
    jwtToken = token;
    getwayJwtToken = getWayToken;
    const url = `${process.env.API_URL}recordings`;
    const filePath = "assets/video-test-file-small.mp4";
    const data = fs.readFileSync(filePath, "utf8");
    const blob = new Blob([data], { type: "video/mp4" });
    const formData = new FormData();
    formData.append("file", blob, `${fileName}.mp4`);
    formData.append("token", getwayJwtToken);
    console.log("fileName", fileName, buildingId, cameraId);
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    // console.log("fileupload status", response.status, response);
    expect(response.status).toEqual(200);
  });

  test.describe("should return  200 when  provided params are valid", () => {
    test("Should return status 200 and accurate data for newly uploaded file", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp.url);
      expect(getFileResp.url).not.toBe(undefined);
      expect(getFileResponse.status).toBe(200);
    });
  });

  test.describe("Bad requests tests for [GET] files endpoint", () => {
    test("Should return status 400 and error filename' datetime must be in the past in case if filename is in future", async () => {
      const fileNameFormFuture = getDateDaysInFuture(365);
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileNameFormFuture}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log(getFileResp.error);
      expect(getFileResp.error).toBe("'filename' datetime must be in the past");
      expect(getFileResponse.status).toBe(400);
    });

    test("should return status 400 when  file name format  is not correct", async () => {
      const wrongFileName = fileName.replace("--", ":").replace("-", ":");
      console.log("fName", wrongFileName);
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${wrongFileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log(getFileResp.error);
      expect(getFileResp.error).toBe(
        "'filename' argument must be in yyyy-MM-dd--HH-mm-ss format"
      );
      expect(getFileResponse.status).toBe(400);
    });

    test("should return status 400 when file name  is not a valid date", async () => {
      const fName = "incorrectDate";
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log(getFileResp.error);
      expect(getFileResp.error).toBe(
        "'filename' argument must be in yyyy-MM-dd--HH-mm-ss format"
      );
      expect(getFileResponse.status).toBe(400);
    });
  });

  test.describe("File Not found test cases  for [GET] files endpoint", () => {
    test("should return 404 when provided building is is undefined", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/undefined/cameras/${cameraId}/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });

    test("should return 404 when provided cameraId is undefined", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/undefined/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });
    test("should return 404 when provided building is null", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/null/cameras/${cameraId}/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });

    test("should return 404 when provided cameraId is null", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/null/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });
    test("should return 404 when provided building type is incorrect (number)", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/125/cameras/${cameraId}/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });
    test("should return 404 when provided cameraId type is incorrect (number)", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/125/files/${fileName}?token=${jwtToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp, getFileResponse);
      console.log("error", getFileResp.error);
      expect(getFileResp.error).toBe("File not found");
      expect(getFileResponse.status).toBe(404);
    });
  });
  test.describe("Unauthorized access tests for [GET] files endpoint", () => {
    test("Should return status 401 when JWT secret is missing or incorrect", async () => {
      const token = sign({}, "incorrect  secret");
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileName}?token=${token}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp.erro);
      expect(getFileResp.error).toBe("Permission denied");
      expect(getFileResponse.status).toBe(401);
    });

    test("Should return status 401 when JWT token is corrupted", async () => {
      const authToken = jwtToken.substring(0, jwtToken.length - 2);

      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileName}?token=${authToken}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp.erro);
      expect(getFileResp.error).toBe("Permission denied");
      expect(getFileResponse.status).toBe(401);
    });

    test("Should return status 401 when JWT token is missing", async () => {
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileName}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp.erro);
      expect(getFileResp.error).toBe("Permission denied, missing token");
      expect(getFileResponse.status).toBe(401);
    });

    test("Should return status 401 when getway secret  is provided instead  of client", async () => {
      const token = sign({}, process.env.GETWAY_JWT_SECRET);
      const getFileUrl = `${process.env.API_URL}recordings/buildings/${buildingId}/cameras/${cameraId}/files/${fileName}?token=${token}`;
      const getFileResponse = await fetch(getFileUrl);

      const getFileResp = await getFileResponse.json();
      console.log(getFileResp.erro);
      expect(getFileResp.error).toBe("Permission denied");
      expect(getFileResponse.status).toBe(401);
    });
  });
});
