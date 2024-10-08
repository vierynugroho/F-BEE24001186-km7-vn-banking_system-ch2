<h1 align="center">
  Chapter 2 & 3 - Banking System
</h1>

# Flowchart

<div id='image' align='center'>
<img src='./assets/flowchart-ch2-bejs.png' alt='flowchart' title='flowchart banking_system - Viery Nugroho'>
</div>

1. **START**
2. program dimulai maka akan menampilkan menu dengan 4 pilihan/kode menu (deposit, withdraw, log transaction, exit)
3. jika memilih kode menu 1 = memilih deposit
   1. menampilkan halaman deposit (add balance)
   2. memvalidasi input add balance
   3. jika gagal diarahkan ke menu dan menampilkan pesan kesalahan && jika valid diarahkan ke menu dengan menampilkan pesan sukses dan transaksi sukses
4. jika memilih kode menu 2 = memilih withdraw
   1. menampilkan halaman withdraw (balance reduction)
   2. memvalidasi input withdraw/balance reduction
   3. jika gagal diarahkan ke menu dan menampilkan pesan kesalahan && jika valid diarahkan ke menu dengan menampilkan pesan sukses dan transaksi sukses
5. jika memilih kode menu 3 = memilih log transaksi
   1. kembali ke halaman menu dan menampilkan log transaksi
6. jika memilih kode menu 4 = memilih exit
   1. menampilkan kalimat konfirmasi apakah ingin keluar dari banking system
   2. jika menekan y || Y maka akan mengakhiri sistem, jika selain y || Y akan kembali ke menu
7. **FINISH**

# ERD

<div id='image' align='center'>
<img src='./assets/erd_ch3.png' alt='ERD' title='ERD banking_system CH 3 - Viery Nugroho'>
</div>

# (BANKING SYSTEM) HOW TO RUNNING

1. ` node bank_system.js`

# (DATABASE) HOW TO MIGRATE & RUNNING THE QUERIES

```
1. migrate customers
2. migrate accounts
3. migrate transactions
4. seed data customer
5. seed data account
6. seed data transaction
7. banking_system queries 'playground'
8. indexing on tbl_transaction at db/migration/create_table_transactions.sql
```

### INDEXING TESTING

#### Without Indexing

<div id='image' align='center'>
<img src='./assets/without_idx.png' alt='Without Indexing' title='Without Indexing - banking_system CH 3 - Viery Nugroho'>
</div>

#### With Indexing

<div id='image' align='center'>
<img src='./assets/idx_transactions_type.png' alt='With Indexing' title='With Indexing - banking_system CH 3 - Viery Nugroho'>
</div>

# Data Diri

|                  |                                      |
| ---------------- | ------------------------------------ |
| ID Peserta       | **BES2409KM7023**                    |
| Nama Peserta     | **Viery Nugroho**                    |
|                  |                                      |
| Kelas            | **BEJS 1**                           |
|                  |                                      |
| ID Fasil         | **F-BEE24001186**                    |
| Nama Fasilitator | **Mughie Arief Mughoni Satyakusuma** |
|                  |                                      |

# Backend Javascript

### KM x Binar Academy Batch 7

|                        |
| ---------------------- |
| **Catatan**            |
| Submission Per Chapter |
