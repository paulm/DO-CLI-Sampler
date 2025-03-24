Usage: dayone2 [options] command

 Commands:
   new [text] [text]...
     Creates new entry with optional text. Every text argument will be separated by
     a single space when placed into the new entry. If no text arguments are provided
     then standard input is used by default for the entry text. Use --no-stdin to override
     this behavior.
   
   help
     Display help.

 Environment:
   DAYONE_APP_PATH:
     If defined will look for day one at path in variable.
     The Day One app is needed for CLI to work.
     
     These paths are searched in order, first one that works is the one used:
       1. DAYONE_APP_PATH
       2. /Applications/Day One.app
       3. Asking system for path to app for com.bloombuilt.dayone-mac

 Options:
  -a, --attachments; -p, --photos:
      The p/photos options are deprecated, change to use a/attachments options instead.
      For now both p/photos and a/attachments do the same thing (they are aliases of each-other).
      
      Path to one or more attachment file(s) separated by spaces.
      Currently supported attachments are: photo/image, video, audio, and pdf.
      
      If desired you can use an [{attachment}] placeholder in entry text to position attachment.
      The old style [{photo}] placeholder is still supported for backwards compatibility,
      but should be changed to use [{attachment}] from now on.
      
      Can only have up to 10 attachments listed.  If this option is the last one listed,
      you must place an -- at the end of the list prior to the command.
      Otherwise the command you provide would be considered an attachment path instead.
      
      Example: dayone2 -a ~/Documents/photo1.jpg ~/Documents/some_pdf2.pdf -- new my entry text
  -t, --tags:
      One or more tags for entry.Example: --tags Soccer\ Match Win
         ^ This example would assign the tags 'Soccer Match' and 'Win' to the entry.
      Using -- will stop parsing options, you can use this at the end of a list of tags if needed.
  -j, --journal:
      Name of journal for entry. Journal must already exist.
      If not specified then the default journal will be used.
  -d, --date:
      Date to use, otherwise will use today/now.
      Example Format: yyyy-mm-dd [hh:mm[:ss]] [AM|PM], time/seconds are optional.
      Uses current system time zone unless you use the --timeZone option.
      Other formats are possible, such as 'Last Tuesday' or '12/30/2016', etc.
      Example Use: --date='2015-06-01 15:53:10'
  -z, --time-zone:
      Time zone to use, for a list see /usr/share/zoneinfo.
      The name is expected to be a name from the IANA Time Zone Database.
      (see http://www.iana.org/time-zones   or   /usr/share/zoneinfo)
      Alternatively, you can specify the name as a GMT offset.
      Examples:
       -z America/Anchorage
       -z Australia/Victoria
       --time-zone GMT-0700
  --isoDate:
      Date to use in ISO 8601 format. Format: yyyy-mm-ddThh:mm:ssZ
      Always interprets the time in the UTC time zone in the Gregorian calendar.
      Entry its self will still use current system time zone unless --timeZone option is used
      Example: --date=2015-06-01T15:53:10Z
  --all-day:
      Marks the entry as an all-day event, ignoring specific times.
      When used, the date will be treated as spanning the whole day.
      Example: --all-day
  -s, --starred:
      Star entry if flag is present. Example: --starred
  --coordinate:
      Coordinate of entry location, must provide two numbers with the first a latitude,
      and the second a longitude.
      Example: --coordinate 32.513 35.621
  --no-stdin:
      Ignore standard in. By default standard in is used if no text arguments are used for the new command.
      Example: --no-stdin
  -h, --help:
      If help option is set, only the help will be displayed and no commands will be executed.
  -v, --version:
      If version option is set, only the version will be displayed and no commands will be executed.
  --verbose:
      If verbose option is set, will log out to stderr at verbose log level (normally only log errors).
