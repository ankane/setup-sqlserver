# setup-sqlserver

The missing action for SQL Server :tada:

- Simpler than containers
- Works on Linux and Windows
- Supports different versions

[![Build Status](https://github.com/ankane/setup-sqlserver/actions/workflows/build.yml/badge.svg)](https://github.com/ankane/setup-sqlserver/actions)

## Getting Started

Add it as a step to your workflow

```yml
      - uses: ankane/setup-sqlserver@v1
        with:
          accept-eula: true
```

`accept-eula` confirms your acceptance of the End-User Licensing Agreement

## Versions

Specify a version

```yml
      - uses: ankane/setup-sqlserver@v1
        with:
          accept-eula: true
          sqlserver-version: 2019
```

Currently supports

Version | `2022` | `2019`
--- | --- | ---
`ubuntu-22.04` | default |
`ubuntu-20.04` | default | ✓
`windows-2022` | default | ✓
`windows-2019` | default | ✓

Test against multiple versions

```yml
    strategy:
      matrix:
        sqlserver-version: [2022, 2019]
    steps:
      - uses: ankane/setup-sqlserver@v1
        with:
          accept-eula: true
          sqlserver-version: ${{ matrix.sqlserver-version }}
```

## Extra Steps

Create a database

```yml
      - run: sqlcmd -U SA -P 'YourStrong!Passw0rd' -Q 'CREATE DATABASE testdb'
```

Run queries

```yml
      - run: sqlcmd -U SA -P 'YourStrong!Passw0rd' -d testdb -Q 'SELECT @@VERSION'
```

## Related Actions

- [setup-postgres](https://github.com/ankane/setup-postgres)
- [setup-mysql](https://github.com/ankane/setup-mysql)
- [setup-mariadb](https://github.com/ankane/setup-mariadb)
- [setup-mongodb](https://github.com/ankane/setup-mongodb)
- [setup-elasticsearch](https://github.com/ankane/setup-elasticsearch)
- [setup-opensearch](https://github.com/ankane/setup-opensearch)

## Resources

Linux

- [Install SQL Server and create a database on Ubuntu](https://docs.microsoft.com/en-us/sql/linux/quickstart-install-connect-ubuntu)
- [Unattended SQL Server installation script for Ubuntu](https://docs.microsoft.com/en-us/sql/linux/sample-unattended-install-ubuntu)

Windows

- [Install SQL Server from the Command Prompt](https://docs.microsoft.com/en-us/sql/database-engine/install-windows/install-sql-server-from-the-command-prompt)
- [Automating SQL Server Deployment with Packer, Terraform, and Ansible](https://eqxtech.com/engineering/automating-sql-server-deployment-with-packer-terraform-and-ansible/)

## Contributing

Everyone is encouraged to help improve this project. Here are a few ways you can help:

- [Report bugs](https://github.com/ankane/setup-sqlserver/issues)
- Fix bugs and [submit pull requests](https://github.com/ankane/setup-sqlserver/pulls)
- Write, clarify, or fix documentation
- Suggest or add new features
