package com.example.Rock4Mining.utils;

import com.example.Rock4Mining.dto.AuditLogResponseDTO;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
public class ExportUtil {

    // Creates a minimal but valid XLSX file
    public byte[] exportAuditLogsToExcel(List<AuditLogResponseDTO> auditLogs) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ZipOutputStream zos = new ZipOutputStream(baos);

        // Add required files for XLSX format
        addContentTypes(zos);
        addRels(zos);
        addWorkbook(zos);
        addStyles(zos);
        addSharedStrings(zos, auditLogs);
        addWorksheet(zos, auditLogs);

        zos.close();
        return baos.toByteArray();
    }

    // For backward compatibility
    public byte[] exportAuditLogsToCSV(List<AuditLogResponseDTO> auditLogs) throws IOException {
        return exportAuditLogsToExcel(auditLogs);
    }

    private void addContentTypes(ZipOutputStream zos) throws IOException {
        String contentTypes =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">\n" +
                        "  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>\n" +
                        "  <Default Extension=\"xml\" ContentType=\"application/xml\"/>\n" +
                        "  <Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>\n" +
                        "  <Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>\n" +
                        "  <Override PartName=\"/xl/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\"/>\n" +
                        "  <Override PartName=\"/xl/sharedStrings.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml\"/>\n" +
                        "</Types>";

        addToZip(zos, "[Content_Types].xml", contentTypes);
    }

    private void addRels(ZipOutputStream zos) throws IOException {
        String rels =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\n" +
                        "  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>\n" +
                        "</Relationships>";

        addToZip(zos, "_rels/.rels", rels);

        String workbookRels =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">\n" +
                        "  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>\n" +
                        "  <Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles\" Target=\"styles.xml\"/>\n" +
                        "  <Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings\" Target=\"sharedStrings.xml\"/>\n" +
                        "</Relationships>";

        addToZip(zos, "xl/_rels/workbook.xml.rels", workbookRels);
    }

    private void addWorkbook(ZipOutputStream zos) throws IOException {
        String workbook =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<workbook xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">\n" +
                        "  <sheets>\n" +
                        "    <sheet name=\"Audit Logs\" sheetId=\"1\" r:id=\"rId1\"/>\n" +
                        "  </sheets>\n" +
                        "</workbook>";

        addToZip(zos, "xl/workbook.xml", workbook);
    }

    private void addStyles(ZipOutputStream zos) throws IOException {
        String styles =
                "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" +
                        "<styleSheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">\n" +
                        "  <fonts count=\"2\">\n" +
                        "    <font>\n" +
                        "      <sz val=\"11\"/>\n" +
                        "      <name val=\"Calibri\"/>\n" +
                        "    </font>\n" +
                        "    <font>\n" +
                        "      <b/>\n" +
                        "      <sz val=\"11\"/>\n" +
                        "      <name val=\"Calibri\"/>\n" +
                        "    </font>\n" +
                        "  </fonts>\n" +
                        "  <fills count=\"1\">\n" +
                        "    <fill>\n" +
                        "      <patternFill patternType=\"none\"/>\n" +
                        "    </fill>\n" +
                        "  </fills>\n" +
                        "  <borders count=\"1\">\n" +
                        "    <border>\n" +
                        "      <left/>\n" +
                        "      <right/>\n" +
                        "      <top/>\n" +
                        "      <bottom/>\n" +
                        "    </border>\n" +
                        "  </borders>\n" +
                        "  <cellStyleXfs count=\"1\">\n" +
                        "    <xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\"/>\n" +
                        "  </cellStyleXfs>\n" +
                        "  <cellXfs count=\"2\">\n" +
                        "    <xf numFmtId=\"0\" fontId=\"0\" fillId=\"0\" borderId=\"0\" xfId=\"0\"/>\n" +
                        "    <xf numFmtId=\"0\" fontId=\"1\" fillId=\"0\" borderId=\"0\" xfId=\"0\" applyFont=\"1\"/>\n" +
                        "  </cellXfs>\n" +
                        "</styleSheet>";

        addToZip(zos, "xl/styles.xml", styles);
    }

    private void addSharedStrings(ZipOutputStream zos, List<AuditLogResponseDTO> auditLogs) throws IOException {
        StringBuilder sharedStrings = new StringBuilder();
        sharedStrings.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n")
                .append("<sst xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\" count=\"")
                .append(9 + auditLogs.size() * 9) // 9 headers + 9 values per row
                .append("\" uniqueCount=\"")
                .append(9 + auditLogs.size() * 9)
                .append("\">\n");

        // Add header strings
        addSharedString(sharedStrings, "ID");
        addSharedString(sharedStrings, "Entity Type");
        addSharedString(sharedStrings, "Entity ID");
        addSharedString(sharedStrings, "Action");
        addSharedString(sharedStrings, "Changes");
        addSharedString(sharedStrings, "Username");
        addSharedString(sharedStrings, "Timestamp");
        addSharedString(sharedStrings, "IP Address");
        addSharedString(sharedStrings, "User Agent");

        // Add data strings
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (AuditLogResponseDTO log : auditLogs) {
            addSharedString(sharedStrings, log.getId() != null ? log.getId().toString() : "");
            addSharedString(sharedStrings, log.getEntityType() != null ? log.getEntityType() : "");
            addSharedString(sharedStrings, log.getEntityId() != null ? log.getEntityId().toString() : "");
            addSharedString(sharedStrings, log.getAction() != null ? log.getAction() : "");
            addSharedString(sharedStrings, log.getChanges() != null ? log.getChanges() : "");
            addSharedString(sharedStrings, log.getUsername() != null ? log.getUsername() : "");
            addSharedString(sharedStrings, log.getTimestamp() != null ? log.getTimestamp().format(formatter) : "");
            addSharedString(sharedStrings, log.getIpAddress() != null ? log.getIpAddress() : "");
            addSharedString(sharedStrings, log.getUserAgent() != null ? log.getUserAgent() : "");
        }

        sharedStrings.append("</sst>");

        addToZip(zos, "xl/sharedStrings.xml", sharedStrings.toString());
    }

    private void addSharedString(StringBuilder sb, String value) {
        sb.append("  <si>\n")
                .append("    <t>")
                .append(escapeXml(value))
                .append("</t>\n")
                .append("  </si>\n");
    }

    private void addWorksheet(ZipOutputStream zos, List<AuditLogResponseDTO> auditLogs) throws IOException {
        StringBuilder worksheet = new StringBuilder();
        worksheet.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n")
                .append("<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\">\n")
                .append("  <sheetData>\n");

        // Add header row
        worksheet.append("    <row r=\"1\">\n");
        for (int i = 0; i < 9; i++) {
            char colLetter = (char)('A' + i);
            worksheet.append("      <c r=\"")
                    .append(colLetter)
                    .append("1\" s=\"1\" t=\"s\">\n")
                    .append("        <v>")
                    .append(i)
                    .append("</v>\n")
                    .append("      </c>\n");
        }
        worksheet.append("    </row>\n");

        // Add data rows
        int stringIndex = 9; // Start after the header strings
        for (int rowNum = 0; rowNum < auditLogs.size(); rowNum++) {
            worksheet.append("    <row r=\"")
                    .append(rowNum + 2)
                    .append("\">\n");

            for (int colNum = 0; colNum < 9; colNum++) {
                char colLetter = (char)('A' + colNum);
                worksheet.append("      <c r=\"")
                        .append(colLetter)
                        .append(rowNum + 2)
                        .append("\" t=\"s\">\n")
                        .append("        <v>")
                        .append(stringIndex++)
                        .append("</v>\n")
                        .append("      </c>\n");
            }

            worksheet.append("    </row>\n");
        }

        worksheet.append("  </sheetData>\n")
                .append("</worksheet>");

        addToZip(zos, "xl/worksheets/sheet1.xml", worksheet.toString());
    }

    private void addToZip(ZipOutputStream zos, String entryName, String content) throws IOException {
        ZipEntry entry = new ZipEntry(entryName);
        zos.putNextEntry(entry);
        zos.write(content.getBytes("UTF-8"));
        zos.closeEntry();
    }

    private String escapeXml(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}