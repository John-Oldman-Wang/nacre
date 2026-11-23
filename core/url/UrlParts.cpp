#include "UrlParts.h"

#include <string_view>

#include "ada.h"

namespace nacre {
namespace {

// JSON 字符串字面量。ada 给的各部分已经是百分号编码过的 ASCII 或合法的 UTF-8
// （主机名转成了 punycode），只需要转义引号、反斜杠和控制字符
void AppendJsonString(std::string_view s, std::string* out) {
  static const char kHex[] = "0123456789abcdef";
  out->push_back('"');
  for (unsigned char c : s) {
    switch (c) {
      case '"': out->append("\\\""); break;
      case '\\': out->append("\\\\"); break;
      case '\n': out->append("\\n"); break;
      case '\r': out->append("\\r"); break;
      case '\t': out->append("\\t"); break;
      default:
        if (c < 0x20) {
          out->append("\\u00");
          out->push_back(kHex[c >> 4]);
          out->push_back(kHex[c & 0xF]);
        } else {
          out->push_back(static_cast<char>(c));
        }
    }
  }
  out->push_back('"');
}

void AppendField(const char* name, std::string_view value, std::string* out) {
  if (out->size() > 1) out->push_back(',');
  AppendJsonString(name, out);
  out->push_back(':');
  AppendJsonString(value, out);
}

}  // namespace

std::string ParseUrlParts(const std::string& url, const std::string& base) {
  ada::result<ada::url_aggregator> parsed = base.empty()
      ? ada::parse<ada::url_aggregator>(url)
      : [&] {
          ada::result<ada::url_aggregator> base_url = ada::parse<ada::url_aggregator>(base);
          if (!base_url) return base_url;
          const ada::url_aggregator& b = *base_url;
          return ada::parse<ada::url_aggregator>(url, &b);
        }();
  if (!parsed) return std::string();

  const ada::url_aggregator& u = *parsed;
  std::string out = "{";
  AppendField("protocol", u.get_protocol(), &out);
  AppendField("username", u.get_username(), &out);
  AppendField("password", u.get_password(), &out);
  AppendField("hostname", u.get_hostname(), &out);
  AppendField("host", u.get_host(), &out);
  AppendField("port", u.get_port(), &out);
  AppendField("pathname", u.get_pathname(), &out);
  AppendField("search", u.get_search(), &out);
  AppendField("hash", u.get_hash(), &out);
  AppendField("origin", u.get_origin(), &out);
  out.push_back('}');
  return out;
}

}  // namespace nacre
