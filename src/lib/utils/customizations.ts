type CustomAsset = {
  logo: string;
  darkLogo?: string;
  favicon: string;
  title: string;
};

type Domain = 'default' | `https://${string}`; // TODO, don't allow to end with /

export const customAssets: Record<Domain, CustomAsset> = {
  default: {
    logo: 'logotype_blueliv.svg',
    darkLogo: 'logotype_blueliv_white.svg',
    favicon: 'favicon_blueliv.ico',
    title: 'Blueliv'
  },
  'https://dt.doh.gov.ae': {
    logo: 'logotype_doh.png',
    darkLogo: 'logotype_doh_white.png',
    favicon: 'favicon_doh.ico',
    title: 'Department of Health'
  },
  'https://tcpwc.blueliv.com': {
    logo: 'logotype_pwc.png',
    darkLogo: 'logotype_pwc_white.png',
    favicon: 'favicon_pwc.ico',
    title: 'PwC - Threat Intelligence'
  },
  'https://tcmitigate.blueliv.com': {
    logo: 'logotype_mitigate.png',
    darkLogo: 'logotype_mitigate_white.png',
    favicon: 'favicon_mitigate.png',
    title: 'Mitigate'
  },
  'https://tclayer8.blueliv.com': {
    logo: 'logotype_layer8.png',
    darkLogo: 'logotype_layer8_white.png',
    favicon: 'favicon_layer8.ico',
    title: 'Layer8'
  },
  'https://tcmeeza.blueliv.com': {
    logo: 'logotype_meeza.png',
    // darkLogo: 'logotype_meeza.png',
    favicon: 'favicon_meeza.png',
    title: 'MEEZA'
  },
  'https://tcneurosoft.blueliv.com': {
    logo: 'logotype_neurosoft.png',
    darkLogo: 'logotype_neurosoft_white.png',
    favicon: 'favicon_neurosoft.png',
    title: 'Neurosoft'
  },
  'https://tcpronet.blueliv.com': {
    logo: 'logotype_pronet.png',
    darkLogo: 'logotype_pronet.png',
    favicon: 'favicon_pronet.ico',
    title: 'Pronet'
  },
  'https://tcehdf.blueliv.com': {
    logo: 'logotype_ehdf.svg',
    darkLogo: 'logotype_ehdf.svg',
    favicon: 'favicon_ehdf.png',
    title: 'eHosting DataFort'
  },
  'https://tcsubnets.blueliv.com': {
    logo: 'logotype_subnets.png',
    darkLogo: 'logotype_subnets.png',
    favicon: 'favicon_subnets.png',
    title: 'Subnets'
  },
  'https://tcincide.blueliv.com': {
    logo: 'logotype_incide.png',
    darkLogo: 'logotype_incide_white.png',
    favicon: 'favicon_incide.png',
    title: 'Incide'
  },
  'https://tctrustibrands.blueliv.com': {
    logo: 'logotype_trustibrands.svg',
    darkLogo: 'logotype_trustibrands_white.svg',
    favicon: 'favicon_trustibrands.svg',
    title: 'TrustiBrands'
  },
  'https://tcsothis.blueliv.com': {
    logo: 'logotype_sothis.png',
    // darkLogo: 'logotype_sothis.png',
    favicon: 'favicon_sothis.png',
    title: 'Sothis'
  },
  'https://tcinnotec.blueliv.com': {
    logo: 'logotype_innotec.png',
    favicon: 'favicon_innotec.ico',
    title: 'Innotec Security'
  },
  'https://tcingenia.blueliv.com': {
    logo: 'logotype_ingenia.png',
    darkLogo: 'logotype_ingenia_white.png',
    favicon: 'favicon_ingenia.png',
    title: 'Ingenia'
  },
  'https://tcdacoso.blueliv.com': {
    logo: 'logotype_dacoso.png',
    darkLogo: 'logotype_dacoso.png',
    favicon: 'favicon_dacoso.png',
    title: 'Dacoso'
  },
  'https://tctechlab.blueliv.com': {
    logo: 'logotype_techlab.png',
    darkLogo: 'logotype_techlab.png',
    favicon: 'favicon_techlab.ico',
    title: 'TechLab'
  },
  'https://tcbodforss.blueliv.com': {
    logo: 'logotype_bodforss.png',
    // darkLogo: 'logotype_bodforss.png',
    favicon: 'favicon_bodforss.png',
    title: 'Bodforss Consulting AB'
  },
  'https://tcsiemens.blueliv.com': {
    logo: 'logotype_siemens.png',
    darkLogo: 'logotype_siemens.png',
    favicon: 'favicon_siemens.ico',
    title: 'Siemens'
  },
  'https://tcclaranet.blueliv.com': {
    logo: 'logotype_claranet.svg',
    darkLogo: 'logotype_claranet.svg',
    favicon: 'favicon_claranet.png',
    title: 'Claranet'
  },
  'https://tcversia.blueliv.com': {
    logo: 'logotype_versia.png',
    // darkLogo: 'logotype_versia.png',
    favicon: 'favicon_versia.png',
    title: 'Versia'
  },
  'https://tcdg.blueliv.com': {
    logo: 'logotype_glasfaser.svg',
    // darkLogo: 'logotype_glasfaser.svg',
    favicon: 'favicon_glasfaser.png',
    title: 'Deutsche-Glasfaser'
  },
  'https://tcwise.blueliv.com': {
    logo: 'logotype_wsg.png',
    darkLogo: 'logotype_wsg_white.png',
    favicon: 'favicon_wise.png',
    title: 'Wise Security'
  },
  'https://tcdenexus.blueliv.com': {
    logo: 'logotype_denexus.png',
    // darkLogo: 'logotype_denexus.png',
    favicon: 'favicon_denexus.ico',
    title: 'Denexus'
  },
  'https://tceccouncil.blueliv.com': {
    logo: 'logotype_eccouncil.png',
    darkLogo: 'logotype_eccouncil.png',
    favicon: 'favicon_blueliv.ico',
    title: 'Blueliv'
  },
  'https://incoprevenciontc.blueliv.com': {
    logo: 'logotype_inco.png',
    // darkLogo: 'logotype_inco.png',
    favicon: 'favicon_inco.png',
    title: 'Incocredito Colombia'
  },
  'https://tcdoug.blueliv.com': {
    logo: 'logotype_doug.svg',
    darkLogo: 'logotype_doug.svg',
    favicon: 'favicon_doug.svg',
    title: 'Liberty Global'
  },
  'https://tcnextvision.blueliv.com': {
    logo: 'logotype_nextvision.png',
    favicon: 'favicon_nextvision.png',
    title: 'Nextvision'
  },
  'https://tcmmsoc.blueliv.com': {
    logo: 'logotype_maticmind.png',
    darkLogo: 'logotype_maticmind.png',
    favicon: 'favicon_blueliv.ico',
    title: 'Maticmind'
  },
  'https://claritysec.blueliv.com': {
    logo: 'logotype_clarity.svg',
    darkLogo: 'logotype_clarity.svg',
    favicon: 'favicon_clarity.svg',
    title: 'Clarity Security Intelligence'
  },
  'https://hard2bit.blueliv.com': {
    logo: 'logotype_hard2bit.png',
    darkLogo: 'logotype_hard2bit_admin.png',
    favicon: 'favicon_hard2bit.png',
    title: 'Hard2bit Cybersecurity'
  },
  'https://qsseidor.blueliv.com': {
    logo: 'logotype_seidor.png',
    // darkLogo: 'logotype_seidor.png',
    favicon: 'favicon_seidor.png',
    title: 'Seidor'
  },
  'https://grupocies.blueliv.com': {
    logo: 'logotype_grupocies.png',
    darkLogo: 'logotype_grupocies.png',
    favicon: 'favicon_grupocies.ico',
    title: 'Grupocies'
  },
  'https://secureit.blueliv.com': {
    logo: 'logotype_secureit.png',
    favicon: 'favicon_secureit.png',
    title: 'SecureIT'
  },
  'https://tccipherbit.blueliv.com': {
    logo: 'logotype_cipherbit.png',
    darkLogo: 'logotype_cipherbit_admin.png',
    favicon: 'favicon_cipherbit.ico',
    title: 'Cipherbit'
  },
  'https://bidaidea.blueliv.com': {
    logo: 'logotype_bidaidea.png',
    darkLogo: 'logotype_bidaidea.png',
    favicon: 'favicon_bidaidea.png',
    title: 'Bideaidea'
  },
  'https://tcestratec360.blueliv.com': {
    logo: 'logotype_estratec360.png',
    favicon: 'favicon_estratec360.png',
    title: 'Estratec360'
  },
  'https://innova.blueliv.com': {
    logo: 'logotype_innova.png',
    favicon: 'favicon_innova.png',
    title: 'Innova'
  },
  'https://capgemini.blueliv.com': {
    logo: 'logotype_capgemini.png',
    darkLogo: 'logotype_capgemini.png',
    favicon: 'favicon_capgemini.png',
    title: 'CapGemini'
  },
  'https://tcoptostid.blueliv.com': {
    logo: 'logo_telefonica.png',
    favicon: 'favicon_telefonica.png',
    title: 'Telefonica'
  },
  'https://tcoptostlfn.blueliv.com': {
    logo: 'logo_telefonica.png',
    favicon: 'favicon_telefonica.png',
    title: 'Telefonica'
  },
  'https://tcoptostlfn2.blueliv.com': {
    logo: 'logo_telefonica.png',
    favicon: 'favicon_telefonica.png',
    title: 'Telefonica'
  },
  'https://tcoptostlfn3.blueliv.com': {
    logo: 'logo_telefonica.png',
    favicon: 'favicon_telefonica.png',
    title: 'Telefonica'
  },
  'https://tcoptostlfn4.blueliv.com': {
    logo: 'logo_telefonica.png',
    favicon: 'favicon_telefonica.png',
    title: 'Telefonica'
  }
};
