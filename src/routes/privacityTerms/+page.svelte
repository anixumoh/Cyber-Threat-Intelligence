<script lang="ts">
  import { onMount } from 'svelte';
  import userStore from '$stores/user';
  import { customAssets } from '$lib/utils/customizations';
  import { Checkbox } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import { goto } from '$app/navigation';
  import roleStore from '$stores/role';
  import tokenStore from '$stores/token';

  let loading = false;
  let license = false;

  const client = new Client();
  let appLogo = '';

  onMount(async () => {
    const origin = window.__env.origin;
    appLogo = `assets/brand/${customAssets[origin] ? customAssets[origin].logo : customAssets.default.logo}`;

    if (!$tokenStore) {
      tokenStore.set(localStorage.getItem('TOKEN'));
    }
    if ($tokenStore && !$userStore) {
      userStore.set(await userStore.getUser());
    }
    license = $userStore?.licenseAccepted;
    if (license) {
      await goto('login', { replaceState: true });
    }
  });

  async function saveAcceptedTerms() {
    loading = true;
    await client.user.acceptTerms(license);
    $userStore.licenseAccepted = license;
    const response = await client.user.shouldEnable2FA();
    const forced = response.data ?? false;
    const route = $roleStore.master || $roleStore.superadmin || !forced ? '/dashboard' : '/login';
    loading = false;

    await goto(route);
  }
</script>

<div class="container">
  <div class="mt-24 mb-36">
    <div class=" clearfix mb-4">
      <h2 class="font-bold mb-4">Privacity of Terms...</h2>
      <h4 class="mb-6">END-USER LICENSE AGREEMENT</h4>
      <img class="mt-1 ml-2 mr-1 w-20" src={appLogo} alt="Brand logo" />
      <span class="copyright"> &#169;</span>
    </div>
    <div class="mb-12">
      <h5 class="font-bold mb-4">1. INTRODUCTION</h5>
      <p>
        This End User License Agreement (“EULA“) is a legal agreement between your company (hereinafter “You”, “Your” or
        the “Client”) and LEAP IN VALUE, S.L., a company duly incorporated in accordance with the laws of the Kingdom of
        Spain, with corporate address at Plaza de Gala Placidia, 1 – 3, Oficina 303, 08006. Barcelona, Spain, with
        Spanish tax identification number B64969181 (Hereinafter, “We”, “Us”, “BLUELIV” or the “Company”) that governs
        your acquisition of a license to use our proprietary Software directly from BLUELIV or indirectly through an
        authorized reseller or distributor (a “Reseller”) and bound by the terms and conditions of the agreement signed
        with BLUELIV or with the Reseller, as appropriate (hereinafter, the “Agreement”). For the purposes of this EULA,
        Client and BLUELIV shall be individually referred to as the “Party” and collectively as the “Parties”.
      </p>
      <p>
        This EULA constitutes a legally binding Agreement between Client and BLUELIV. By clicking on the “I AGREE”
        button, the physical person (the “Representative”) that is performing such action on behalf of the Client
        warrants and represents (i) that he/she acknowledges to have read, understood and accepted all the terms and
        conditions contained in this EULA on behalf of the Client; (ii) that he/she is a representative with sufficient
        powers currently in force and full legal authority to bind the Client and to accept this EULA on its behalf.
      </p>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">2. END-USER LICENSE</h5>
      <div class="media">
        <h6 class="font-bold">2.1.</h6>
        <div class="media-body ml-2">
          <p>
            For the purposes of this EULA, Software means the object code version of the software proprietary
            applications specified in the appropriate Purchase Order or Quote which includes the specific modules and
            functionalities effectively purchased by Client directly to BLUELIV or through the Reseller, and its
            technology, associated media, printed materials, and online or electronic documentation owned by BLUELIV
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.2.</h6>
        <div class="media-body ml-2">
          <p>
            Subject to the terms and conditions of this EULA, BLUELIV hereby grants to Client a worldwide,
            non-exclusive, non-transferable right to use the Software online on a Software-as-a-Service (“SaaS”) basis
            during the Subscription Period and subject to the terms and conditions contemplated in this EULA and in the
            Agreement signed with Reseller, when applicable
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.3.</h6>
        <div class="media-body ml-2">
          <p>
            BLUELIV owns, or is the Client to, all right, title and interest in and to this Software, including all
            rights under copyright, IP, intellectual property, trade secret, trademark, patent, or unfair competition
            law, and any and all other proprietary rights, including all applications, renewals, extensions and
            restorations herein. Under no circumstance, the Client will be authorized to modify, adapt, translate,
            decompile, prepare derivative works, reverse-engineer, disassemble or otherwise attempt to derive source
            code from the Software and will not remove, or alter BLUELIV’ copyright notice, trademarks or other
            proprietary rights notices contained or accessed in combination with the Software.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.4.</h6>
        <div class="media-body ml-2">
          <p>
            Except as contemplated in the Agreement signed with BLUELIV or with Reseller, Client shall have no right to
            sub-license or otherwise make available the rights herein granted to any third party (related or otherwise)
            and such rights shall only be used by Client in connection with its business activity.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.5.</h6>
        <div class="media-body ml-2">
          <p>
            The Client shall pay license fees directly to BLUELIV or to Reseller in accordance with the terms and
            conditions stipulated in the Agreement signed with BLUELIV or with Reseller. Equally, the Client shall be
            responsible for paying all use, sales or value added taxes, duties or governmental charges, whether
            presently in force or which come into force in the future, related to the use of the Software. For the
            avoidance of doubt, Client shall not be entitled to any refund in the event of a cancelled subscription or
            unused services.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.6.</h6>
        <div class="media-body ml-2">
          <p>
            The Client will not, and will not authorize any employee or agent or any related, affiliated, subsidiary or
            third party to:
          </p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              Except as where expressly authorized in the Agreement signed with BLUELIV or with Reseller, distribute,
              sell, lease, assign, transfer, trade, rent, publish or sub-license the Software or any part thereof
              including copies thereof to any other entity, rent, lease rights, copy, offer, offer under a different
              label, publish, sell, or otherwise commercialize in any way the Software or any information or Results
              arising from the Software;
            </li>
            <li class="mb-1 pl-1">
              use the Software or any part thereof for any other purpose other than in connection with the business
              activity of the Client;
            </li>
            <li class="mb-1 pl-1">
              modify or adapt the Software or any part thereof except as specifically permitted in writing by BLUELIV;
            </li>
            <li class="mb-1 pl-1">
              translate, reverse engineer, decompile, disassemble, create derivative work or develop any system or
              program based on the Software or any part thereof;
            </li>
            <li class="mb-1 pl-1">
              include, integrate or import into the Software other object code, technology, applications, or
              functionalities in relation to the Software, without the prior written approval of BLUELIV;
            </li>
            <li class="mb-1 pl-1">
              Use the Software in any manner that could impair, block or interfere the normal operation of the Software,
              or its use by other clients, being its use subject to compliance by the Client with all applicable laws.
            </li>
          </ol>
          <p>
            Client’s right to use the Software will terminate immediately if BLUELIV has a reasonable basis to suspect
            that Client is breaching any provision of these license terms.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.7.</h6>
        <div class="media-body ml-2">
          <p>
            Provided that Client is not in default hereunder being up to date with the payment of the fees and complies
            with the rest of the terms and conditions stipulated herein and in the appropriate Agreement, BLUELIV will
            provide to the Client all upgrades and enhancements to the Software, designated as such by BLUELIV, at no
            additional cost to the Client and the Client shall be obligated to employ all such upgrades and enhancements
            within thirty (30) days of BLUELIV making such upgrades or enhancements available. All upgrades and
            enhancements to the Software will be considered Software for the purposes of this EULA.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">2.8.</h6>
        <div class="media-body ml-2">
          <p>
            From time to time it may be necessary to perform services maintenance on the Software. Such maintenance
            events will normally consist of planned maintenance, and in such a case Client will be notified of such
            events with reasonable notice prior to the event. Reasonable efforts will be made to limit the effect of
            such maintenance on the Software. Notwithstanding the foregoing, there may also occur occasional emergency
            maintenance situations, which may be defined as unplanned events which are intended to correct the failure
            or immanent failure of the Software Maintenance of this type will be performed as soon as is practical and
            every reasonable effort will be made to notify Client and to limit as well the effect of such maintenance on
            the Software.
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">3. REPRESENTATIONS AND WARRANTIES OF <strong>BLUELIV</strong></h5>
      <div class="media">
        <h6 class="font-bold">3.1.</h6>
        <div class="media-body ml-2">
          <p>
            BLUELIV warrants and represents to Client as follows and acknowledges that The Client is relying on such
            representations and warranties in entering into this EULA and the transaction contemplated in this EULA:
          </p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              Capacity: It has the necessary capacity to enter into this EULA and to perform its obligations hereunder;
            </li>
            <li class="mb-1 pl-1">
              No Infringement: To the best of its knowledge, information and belief, the license of the Software to the
              Client as contemplated herein will not infringe upon any patents or copyrights of any third party; and
            </li>
            <li class="mb-1 pl-1">
              Program Error: BLUELIV warrants that if program errors (defects in the Software which prevent substantial
              conformance to the Software specifications) occur during the term of this EULA then, provided that:
              <ol class="lower-alpha my-ol">
                <li class="mb-1 pl-1">
                  Client provides prompt notice to BLUELIV of such Software error and a detailed characterization or
                  description of such error;
                </li>
                <li class="mb-1 pl-1">
                  The Client provides, to the best of its ability at the time, a full and complete written disclosure of
                  the Software error and any input or output necessary to assess the same;
                </li>
                <li class="mb-1 pl-1">
                  this EULA and the Agreement remains in effect and The Client is not then in default hereunder;
                </li>
              </ol>
            </li>
          </ol>
          <p>
            BLUELIV’s sole responsibility and obligation in such a case would be that of responding to notification of
            same by the Client and use its best efforts to correct such errors. BLUELIV will not be held liable or
            responsible in any manner whatsoever for any damages resulting from such Software errors except as expressly
            provided for hereunder, and its obligation to correct a Software error is specifically conditional on the
            satisfaction of all conditions described above.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">3.2.</h6>
        <div class="media-body ml-2">
          <p>Examples of service not covered by BLUELIV’s warranty include, but are not limited to:</p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              Service required due to failure of hardware other than hardware provided by BLUELIV;
            </li>
            <li class="mb-1 pl-1">Failure of software other than the Software as defined in this EULA;</li>
            <li class="mb-1 pl-1">Force majeure;</li>
            <li class="mb-1 pl-1">Default or gross negligence of the Client; and</li>
            <li class="mb-1 pl-1">Providing operating services, accessories or supplies.</li>
          </ol>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">3.3.</h6>
        <div class="media-body ml-2">
          <p>
            EXCEPT AS EXPRESSLY STATED IN THIS EULA AND IN THE AGREEMENT THE SOFTWARE IS PROVIDED AND LICENSED “AS IS”
            AND THERE ARE NO WARRANTIES, REPRESENTATIONS OR CONDITIONS, EXPRESSED OR IMPLIED, WRITTEN OR ORAL, ARISING
            BY STATUTE, OPERATION OF LAW, COURSE OF DEALING, USAGE OF TRADE, COURSE OF PERFORMANCE OR SERVICE PROVIDED
            HEREUNDER OR IN CONNECTION HEREWITH BY BLUELIV. IN PARTICULAR, BLUELIV DOES NOT MAKE ANY UNDERTAKINGS OR
            COMMITMENTS REGARDING THE RESULTS TO BE DELIVERED, ITS FREQUENCY OR AMOUNT. BLUELIV HAS NO CONTROL OVER AND
            MAKES NO REPRESENTATIONS WITH RESPECT TO THE CONTENTS THAT MAY BE DELIVERED OR ANY OTHER ASPECT OF THIRD
            PARTY WEBSITES AND INTERNET SOURCES AND THE RELIABILITY, COMPLETENESS AND ACCURACY OF THE INFORMATION
            DISPLAYED THEREIN IS SUBJECT TO, AMONG OTHER THINGS, THE AVAILABILITY AND OPERATION OF INTERNET ACCESS AND
            SERVICES AND THUS BLUELIV WILL HAVE NO RESPONSIBILITY OR LIABILITY WITH RESPECT THEREWITH.
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">4. REPRESENTATIONS AND WARRANTIES OF THE CLIENT</h5>
      <div class="media">
        <h6 class="font-bold">4.1.</h6>
        <div class="media-body ml-2">
          <p>
            The Client warrants and represents to BLUELIV as follows and acknowledges that BLUELIV is relying on such
            warranties, representations and warranties in entering into this EULA and the transactions contemplated in
            this EULA:
          </p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              <strong>Capacity:</strong> The Client has the necessary capacity to enter into this EULA and to perform its
              obligations hereunder;
            </li>
            <li class="mb-1 pl-1">
              <strong>Use of Software:</strong> The Client will use the Software only in accordance with in compliance with
              the laws of the jurisdiction in which it operates;
            </li>
            <li class="mb-1 pl-1">
              <strong>Conduct of Business:</strong> The Client will pursue the operation of the Software during the term
              of this EULA in a lawful manner and to the best of its ability;
            </li>
            <li class="mb-1 pl-1">
              <strong>Unauthorized Use:</strong> The Client will not permit any third party other to use the Software for
              any purpose other than the one specifically defined under this EULA. In particular, Client is authorized to
              use the Software only in compliance with the applicable laws and regulations and to the extent that such use
              is undertaken solely for lawful purposes related to the search, retrieval and delivery of the Results. Client
              is prohibited from using the Software to conducting searches for other purposes, including, but not limited
              to the following searches (the “Unauthorized Uses”): (i) images of any kind that are prohibited in accordance
              with the applicable laws and regulations; (ii) counterfeit goods, or items intended for use in fraud; (iii)
              intellectual property, trademarks or marks without authorization of the rights-owner; (iv) searches performed
              in order to perform industrial espionage or to steal or to unlawfully use information, material, products,
              intellectual property, or proprietary or confidential information of third parties that have not granted its
              authorization to Client including suppliers, customers, business partners or competitors; (v) Personal information
              (other than personal data in respect of which Client is a data controller, processor or subprocessor).
            </li>
          </ol>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">4.2.</h6>
        <div class="media-body ml-2">
          <p>
            Specifically, the Client warrants and represents that the information provided to BLUELIV is true and
            accurate and that the Client is thus the legitimate owner or holder with sufficient intellectual rights or
            third-party rights of the information that is provided for its analysis through the Software and which will
            be used by BLUELIV as the relevant search criteria which may enable Client to retrieve data, documents,
            credentials or any other materials that are pertinent or related to Client (the “Results”).
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">5. LIMITATION AND EXCLUSION OF LIABILITY</h5>
      <div class="media">
        <h6 class="font-bold">5.1.</h6>
        <div class="media-body ml-2">
          <p>
            If notified promptly in writing of any claim (and all prior related claims) brought against The Client
            alleging that the Client’s use of the Software under this EULA infringes any third party patent or
            copyright, BLUELIV will, subject as provided herein, indemnify the Client against such claim and any
            liability in relation thereto, will in particular defend and settle that claim at its expense and will pay
            the costs and damages of any type awarded against the Client in any proceedings or agreed to be paid by
            BLUELIV in settlement or compromise of the claim, provided that:
          </p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              BLUELIV will have sole control of the defense of any such claim and all negotiations for its settlement or
              compromise; and
            </li>
            <li class="mb-1 pl-1">
              The Client, and where applicable those for whom the Client is responsible, cooperates fully with BLUELIV
              in its defense of the claim.
            </li>
          </ol>
          <p>
            If the Client receives notice of a valid claim or demand regarding infringement, or if the use of the
            Software is prevented by injunction, BLUELIV will, at its option and expense either:
          </p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              Procure for The Client the right to continued use of the Software as provided hereunder which may require
              payment to a third party by the Client (if the Client elects not to make any third-party payment, the
              alleged infringing software may not be available to The Client),
            </li>
            <li class="mb-1 pl-1">Modify the Software so that it is no longer infringing,</li>
            <li class="mb-1 pl-1">Replace the Software with computer software of equal capability, or</li>
            <li class="mb-1 pl-1">Terminate this EULA as to the infringing Software;</li>
          </ol>
          <p>
            Provided that BLUELIV agrees that it will exercise any of the options (1) to (3) prior to exercising option
            (4) if, in BLUELIV’s reasonable opinion, such options are commercially feasible to BLUELIV.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.2.</h6>
        <div class="media-body ml-2">
          <p>
            The foregoing indemnification does not extend to any claim arising out of a modification to the Software by
            any party other than BLUELIV to the extent such claim would not have arisen had such modification not been
            made, any combination of the Software with any other software or hardware to the extent such claim would not
            have arisen had such combination not been made, or the use or distribution of the Software other than as
            permitted under this EULA and the Client will indemnify and hold BLUELIV harmless from any infringement
            actions and liability arising therefrom provided that The Client shall have the same rights to control the
            defense of any claim and negotiations for settlement or compromise and to cooperation from BLUELIV as
            BLUELIV has under this EULA.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.3.</h6>
        <div class="media-body ml-2">
          <p>
            IN NO EVENT WILL EITHER PARTY OR ANY ASSOCIATE, AFFILIATE, PARENT OR SUBSIDIARY CORPORATION OF EITHER PARTY,
            BE LIABLE FOR INCIDENTAL, INDIRECT, SPECIAL OR CONSEQUENTIAL LOSS OR DAMAGES, OR FOR ANY LOSS OR DAMAGES
            WHATSOEVER RESULTING FROM LOSS OF USE OF THE SOFTWARE, LOSS OF ACCESS TO THE SOFTWARE, OR FROM ANY LOSS OF
            DATA, LOST PROFITS, ANTICIPATED SAVINGS, BUSINESS OPPORTUNITY OR GOODWILL, IN EACH CASE ARISING OUT OF OR IN
            ANY WAY CONNECTED WITH THE SOFTWARE OR ARISING OUT OF OR IN CONNECTION WITH THIS EULA OR THE USE OR
            PERFORMANCE OF THE SOFTWARE, OR OTHER MATERIAL WHETHER IN AN ACTION IN CONTRACT OR TORT INCLUDING BUT NOT
            LIMITED TO NEGLIGENCE AND WHETHER OR NOT THE PARTY CONCERNED HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
            DAMAGES. THIS LIMITATION OF LIABILITY SHALL NOT APPLY TO ANY FAILURE TO MAKE PAYMENTS DUE UNDER THIS EULA OR
            THE AGREEMENT.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.4.</h6>
        <div class="media-body ml-2">
          <p>
            Without limiting the general exclusion of liability as provided above, the liability of BLUELIV and any of
            its associates, affiliates, parent or subsidiary corporations to the Client, whether for negligence, breach
            of contract, alleged or actual third party intellectual property infringement, misrepresentation or
            otherwise in respect of a single occurrence or a series of occurrences will in no circumstances exceed the
            lower of the following two amounts: (a) EUR 50,000; or (b) all amounts paid by Client to BLUELIV or, where
            appropriate, to Reseller during the previous six (6) months.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.5.</h6>
        <div class="media-body ml-2">
          <p>
            The Client’s use the Software is made at its own discretion and risk, being the sole responsible for any
            damages to its hardware device(s) or loss of data resulting from the use of this Software. Certain
            functionality is subject to delays beyond BLUELIV’s control, including without limitation, delays or latency
            due to Client’s physical location or other technical elements beyond BLUELIV’ control such as the service
            provider’s network. BLUELIV reserves the right to cancel and discontinue the use of the Software at any
            time.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.6.</h6>
        <div class="media-body ml-2">
          <p>
            BLUELIV is not liable to Client or any user for any use or misuse of this Software. Such limitation: (i)
            includes direct, indirect, incidental, special, consequential, exemplary and punitive damages, whether such
            claim is based on warranty, contract, tort or otherwise (even if BLUELIV has been advised of the possibility
            of such damages); (ii) applies whether damages arise from use or misuse of and reliance on the Software,
            from inability to use the Software or from the suspension, interruption, or termination of this Software
            (including any damages incurred by third parties); and (iii) applies to the fullest extent permitted by law
            and notwithstanding a failure of the essential purpose of any limited remedy.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">5.7.</h6>
        <div class="media-body ml-2">
          <p>
            Client will indemnify and hold harmless BLUELIV and its parents, subsidiaries, officers, directors, agents,
            shareholders and employees, from any claim made by any third party due to or arising directly or indirectly
            out of the Client’s use or misuse of the Software, any alleged violation of this EULA and any alleged
            violation of any applicable law or regulation. BLUELIV reserves the right, at its own expense, to assume the
            exclusive control and defense of any matter subject to indemnification by Client, but doing so will not
            excuse Client’s indemnity obligations towards BLUELIV.
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">6. PRIVACY AND DATA PROTECTION</h5>
      <div class="media">
        <h6 class="font-bold">6.1.</h6>
        <div class="media-body ml-2">
          <p>
            The Client accepts and acknowledges that the Results analyzed, identified, collected and displayed by
            BLUELIV and based in the information previously provided by Client may contain personal data and information
            (the “Personal Data”). In such a case, the Client will act as the data controller (the “Data Controller”) as
            defined in section 4.7 of the EU Regulation 679/2017 on the protection of personal data (the “GDPR”) as well
            as in the applicable local laws and regulations that must be complied by BLUELIV which, in turn, will act as
            the data processor (the “Data Processor”), as defined in section 4.8 of the Regulation, being thus expressly
            authorized by data controller to analyze, identify, collect and display the Results in accordance with the
            terms and conditions of this EULA.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">6.2.</h6>
        <div class="media-body ml-2">
          <p>In its role of data processor BLUELIV will comply with the following obligations:</p>
          <ol class="list-decimal my-ol">
            <li class="mb-1 pl-1">
              Data Processor agrees that it shall acquire no rights or interest in the Personal Data and shall only, and
              shall procure that its personnel only, process the personal data in accordance with this EULA and any
              other written instructions of Data Controller.
            </li>
            <li class="mb-1 pl-1">
              Data Processor shall implement appropriate technical and organisational measures to assure a level of
              security appropriate to the risk to the security of Personal Data, in particular, from accidental or
              unlawful destruction, loss, alteration, unauthorised, disclosure of or access to Personal Data.
            </li>
            <li class="mb-1 pl-1">
              Data Processor will ensure that its personnel who process Personal Data under this Agreement are subject
              to obligations of confidentiality in relation to such Personal Data, have received appropriate training on
              their responsibilities and are subject to obligations of confidentiality and such obligations survive the
              termination of that person’s engagement with Data Processor. Data Processor shall take commercially
              reasonable steps to ensure the reliability of any Data Processor personnel engaged in the processing of
              Personal Data, always ensuring that access to Personal Data is limited to those personnel who require such
              access to perform the GDPR.
            </li>
            <li class="mb-1 pl-1">
              Data Processor has appointed a data protection officer (DPO) where such appointment is required by the
              GDPR. The appointment has been made on the basis of professional qualities and expert knowledge on data
              protection law and practices. Moreover, Data Processor has ensured that DPO is provided with appropriate
              resources to carry out tasks and maintain the expert knowledge, directly reporting to the highest level of
              management. DPO may be contacted at any time at dpo@blueliv.com.
            </li>
            <li class="mb-1 pl-1">
              The Software enables the provision of automated information about the Results. In those cases where the
              recovery or collection of Results may be considered as a data breach, Data Controller deems to have been
              automatically notified by Data Processor about such breach through the display of the Results without any
              further notice, being the Data Controller’s sole responsibility to assure that such Results are promptly
              processed and managed by its personnel for this purpose.
            </li>
            <li class="mb-1 pl-1">
              Data Processor may assist Data Controller within such reasonable timescale as may be determined by Data
              Processor in complying with its obligations pursuant to the conduct of data protection impact assessments,
              security audits, data breach notifications, responding to requests of data subjects in the exercise of
              their rights, prior consultation requests to regulatory authorities or any other additional request
              related to the compliance with the GDPR or any related law or regulation. If such assistance may entail
              significant direct or indirect costs, Data Processor will provide a reasonable budget for Data
              Controller’s approval prior to the provision of the assistance.
            </li>
            <li class="mb-1 pl-1">
              Data Processor Controller may sub-contract commercial partners and suppliers which enable the provision of
              the Software to Client. In the event that such subcontractors may access Personal Data, Data Processor
              will impose on such third party, by means of a written contract, equivalent data protection obligations as
              set out in this Agreement and shall ensure that if any third party engaged by Data Processor in turn
              engages another person to Process any Personal Data, the third party is required to comply with all of the
              obligations in respect of Processing of Personal Data that are imposed under this Agreement.
            </li>
            <li class="mb-1 pl-1">
              Data Processor will comply at all times with the GDPR and the applicable local or EU legal or regulatory
              principles that may apply to international transfers of data as well as any local law or regulation that
              develops the latter.
            </li>
            <li class="mb-1 pl-1">
              On termination or expiry of this EULA (or at any other time on request by Data Controller), Data Processor
              shall return or permanently erase, at the election of Data Controller, all copies of Personal Data
              received and/or processed by it under this Agreement unless European Union or local laws or regulations
              require retention of the Personal Data. Notwithstanding the foregoing, and during the term of this EULA,
              BLUELIV may proceed from time to time to cancel and delete in an unrecoverable way the Results and
              disclaims any and all liability in connection with this action even if the Results contained Personal
              Data. It shall be the Client’s responsibility to download the Results on a regular basis and to keep in
              its servers its own back-up files and recovery procedures in connection with the Results.
            </li>
          </ol>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">7. CONFIDENTIALITY</h5>
      <div class="media">
        <h6 class="font-bold">7.1.</h6>
        <div class="media-body ml-2">
          <p>
            Documentation and information (including electronically, orally or visually disclosed information) are
            confidential and “Proprietary Information” for the purposes of this Section 9 and subject to the provisions
            of subsection 9.6, if (a) it is designated as confidential or proprietary, by letter, stamp or legend (b) it
            would be apparent to a reasonable person, familiar with the disclosing party’s business or the industry in
            which it operates, that such information is of a confidential or proprietary nature, or the disclosing
            party, within ten (10) days of a disclosure, indicates to the receiving party that such disclosure is
            confidential. Proprietary Information shall not include information defined as Proprietary Information above
            which the receiving party can conclusively establish (i) was in the possession of the receiving party at the
            time of disclosure; (ii) prior to or after the time of disclosure becomes part of the public domain without
            the act or omission of the party to whom it was disclosed; (iii) is disclosed to the receiving party by a
            third party under no legal obligation to maintain the confidentiality of such information; or (iv) was
            independently developed by the receiving party. All such Proprietary Information shall be treated
            confidentially by the receiving party and its employees, contractors and agents and shall not be disclosed
            by the receiving party without the disclosing party’s prior written consent. However, the receiving party
            may disclose Proprietary Information of the disclosing party in accordance with judicial or other
            governmental order, provided that receiving party shall give the disclosing party reasonable notice prior to
            such disclosure and shall comply with any applicable protective order or equivalent.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">7.2.</h6>
        <div class="media-body ml-2">
          <p>
            Neither party shall in any way duplicate, all or any part of the other party’s Proprietary Information,
            except in accordance with the terms and conditions of this EULA. Each party shall have an appropriate
            agreement with each of its employees, contractors and agents having access to the other party’s Proprietary
            Information sufficient to enable that party to comply with all the terms of this EULA. Each party agrees to
            protect the other’s Proprietary Information with the same standard of care and procedures that it uses to
            protect its own trade secrets and confidential or proprietary information of like importance and, in any
            event, shall adopt or maintain procedures reasonably calculated to protect such Proprietary Information.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">7.3.</h6>
        <div class="media-body ml-2">
          <p>
            Each party agrees to hold the other party’s Proprietary Information in trust and confidence for such party
            and not to use the same other than as expressly authorized under this EULA. Each party agrees not to
            disclose any such Proprietary Information without the prior written consent of the other, to anyone other
            than that party’s employees, contractors and agents who have a need to know same to carry out the rights
            granted hereunder.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">7.4.</h6>
        <div class="media-body ml-2">
          <p>
            Each party shall promptly report to the other any actual or suspected violation of the terms of this
            Section, and shall take all reasonable steps to prevent, control or remedy such violation.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">7.5.</h6>
        <div class="media-body ml-2">
          <p>
            In recognition of the unique and proprietary nature of the information disclosed by the parties, it is
            agreed that each party’s remedies for a breach by the other of its obligations under this Section 9 shall be
            inadequate and the disclosing party shall, in the event of such breach be entitled to equitable relief,
            including without limitation, injunctive relief and specific performance, in addition to any other remedies
            provided hereunder or available at law.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">7.6.</h6>
        <div class="media-body ml-2">
          <p>
            For the purposes of this EULA and notwithstanding any provisions to the contrary, the Software, and all
            upgrades or modifications to the same and all materials related thereto, including the terms and provisions
            of this EULA, shall be treated as Proprietary Information of BLUELIV, and all client information of the
            Client shall be treated as Proprietary Information of the Client.
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">8. TERM AND TERMINATION</h5>
      <div class="media">
        <h6 class="font-bold">8.1.</h6>
        <div class="media-body ml-2">
          <p>
            Unless earlier terminated in accordance with the provisions hereof, the initial term of this EULA will
            commence on the execution date of the present EULA and will terminate at the end of the Subscription Period,
            as indicated in the Quote or Purchase Order, where such initial term is defined. Notwithstanding the
            foregoing, at the end of the initial term, this EULA and the Agreement shall automatically renew for
            additional one (1) year periods provided that the fees corresponding to the use of the Software are duly
            settled to BLUELIV or, as the case may be, to Reseller in accordance with the terms of the Agreement, and,
            unless any of the Parties decides not to renew by giving a prior written notice to the other Party with at
            least 60 calendar days before the expiry of the initial Subscription Period or any of its yearly extensions.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">8.2.</h6>
        <div class="media-body ml-2">
          <p>
            Either party may terminate this EULA effective immediately upon written notice for cause if the other party
            becomes insolvent, makes a general assignment for the benefit of creditors, files a voluntary petition in
            bankruptcy, suffers or permits the appointment of a receiver for its business assets, or is wound up or
            liquidated, voluntary or otherwise. Any such event or occurrence shall constitute a default under this EULA.
            If any of the above events occur, the subject party shall immediately notify the other party in writing of
            its occurrence.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">8.3.</h6>
        <div class="media-body ml-2">
          <p>
            Upon termination of this EULA, for any reason, the rights and licenses granted to the Client by BLUELIV
            hereunder shall be revoked and shall terminate immediately and the Client shall cease all use of the
            Software.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">8.4.</h6>
        <div class="media-body ml-2">
          <p>
            Subject to any claim or setoff rights of The Client in respect of such termination, no termination of this
            EULA shall release the Client from its obligations to pay BLUELIV or, when appropriate, to the Reseller, any
            fees which accrued prior to such termination or which shall accrue to BLUELIV after the effective date of
            such termination as a result of the Client’s continued use of the Software after the termination of this
            EULA.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">8.5.</h6>
        <div class="media-body ml-2">
          <p>
            Notwithstanding anything contained herein, non-payment by the Client of any fees owed to BLUELIV or, when
            appropriate to Reseller, as provided for herein, at the times specified herein or in the Agreement, which
            non-payment continues for 7 days after notification from BLUELIV directly or through the Reseller, referring
            to this Clause, shall constitute a material breach of this EULA and shall entitle BLUELIV to immediately
            terminate this EULA. In such event BLUELIV shall be entitled to take any and all such actions it may deem
            necessary to prevent the continued use of the Software.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">8.6.</h6>
        <div class="media-body ml-2">
          <p>
            In addition to any other remedies provided in this EULA, BLUELIV shall have the right to terminate this EULA
            upon notice to The Client, in the event that the Client is guilty of, violates or is alleged to have
            violated in the course of its operation of the Software hereunder, any local, state or federal laws, rules
            and regulations, provided that such breach has not been cured by The Client.
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12">
      <h5 class="font-bold mb-4">9. MISCELLANEOUS PROVISIONS</h5>
      <div class="media">
        <h6 class="font-bold">9.1.</h6>
        <div class="media-body ml-2">
          <p>
            This EULA, together with the Purchase Order, the Quote and any other additional document expressly accepted
            and agreed by BLUELIV, sets forth the entire agreement and understanding between BLUELIV and the Client with
            respect to the subject matter described herein and supersedes all prior or contemporaneous negotiations,
            understandings and agreements, whether oral or written between BLUELIV and Client concerning the subject
            matter hereof. In the event of any conflict between the terms and conditions of the Agreement signed with
            BLUELIV or, when applicable, with the Reseller, the terms and conditions of this EULA will prevail.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.2.</h6>
        <div class="media-body ml-2">
          <p>
            Client warrants and represents that it is not located in a country that is subject to a US Government
            embargo, or that has been designated by the US Government as a “terrorist supporting” country and that it is
            not listed on any US Government list of prohibited or restricted parties. This Software or its underlying
            technology may not be downloaded to or exported or re-exported into such countries.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.3.</h6>
        <div class="media-body ml-2">
          <p>
            Terms of software or IT terminology, which are not otherwise herein defined, will have the meanings normally
            attributed thereto in the software or IT industry, unless the context of the use of such terminology would
            suggest otherwise.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.4.</h6>
        <div class="media-body ml-2">
          <p>
            This EULA shall be governed by the laws of the Kingdom of Spain, exclusive of any conflicts of laws
            principles, which would require the application of the laws of another jurisdiction. Any and all disputes
            arising under this EULA shall be subject to the exclusive jurisdiction of the competent judges and courts
            located in the city of Barcelona, being any other venue or court expressly waived by the Parties.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.5.</h6>
        <div class="media-body ml-2">
          <p>
            A party will not be held responsible, nor will it be considered in breach of this EULA, for its failure to
            fulfil any terms or provisions hereof if such failure was a result of civil disorder, war, riot,
            governmental decrees or laws, acts of enemies or terrorists, strikes, fires, floods, acts of God, failure of
            telecommunications facilities or Internet service providers, attacks on the system by DOS (Denial of
            Service) DDOS (Distributed Denial of Service) or otherwise, or by any other cause not within the control of
            that party and which could not have been prevented by that party exercising reasonable diligence.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.6.</h6>
        <div class="media-body ml-2">
          <p>
            The parties to this EULA are independent contractors and neither party is the agent, joint venture, partner
            or employee of the other. No relationships of principal to an agent, master to a servant, employer to
            employee, franchiser to franchisee, partners or joint venture is established hereby between the parties.
            Neither party has the authority to bind the other nor incur any obligation on its behalf.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.7.</h6>
        <div class="media-body ml-2">
          <p>
            The parties covenant and agree to make all applications, execute all other deeds, documents, instruments and
            assurances, and do such further and other acts as may be necessary or desirable to carry out the true intent
            and meaning of this EULA, and to give full effect to the transactions contemplated or intended hereby.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.8.</h6>
        <div class="media-body ml-2">
          <p>
            No amendment or other modification of this EULA will be valid or binding on either party hereto, unless in
            writing and executed by the parties hereto. Notwithstanding the foregoing, BLUELIV may amend the terms and
            conditions of the EULA from time to time and your use of the Software following such amendments shall be
            deemed to be your acceptance to such amendments. It is Your responsibility to check regularly the terms and
            conditions of the EULA to determine if it has changed. If You do not agree to any amendment to the EULA You
            must immediately stop using it and contact BLUELIV.
          </p>
        </div>
      </div>
      <div class="media">
        <h6 class="font-bold">9.9.</h6>
        <div class="media-body ml-2">
          <p>
            Neither party may assign this EULA nor the rights granted hereunder without the prior written consent of the
            other, provided that BLUELIV may assign all or any part of its rights under this EULA to a parent, affiliate
            or beneficially wholly-owned subsidiary; provided that any such organization is able to perform under this
            EULA and agrees to be bound by the terms hereof, and The Client agrees to provide reasonable assistance to
            BLUELIV by executing any required documentation in the event an assignment of such obligations is required
            by BLUELIV.
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3 border-top pt-4">
      <div class="row">
        <div class="col-md-6 offset-md-3">
          {#if $userStore}
            <div class="toggle-button">
              <Checkbox labelText="I agree to the terms" bind:checked={license} />
            </div>
          {/if}
          <br />
          {#if $userStore}
            <button
              class="btn btn-lg btn-primary btn-block"
              disabled={!license || loading}
              on:click={saveAcceptedTerms}
            >
              {loading ? 'Loading' : 'Continue'}
              {#if loading}
                <i class="icon-spinner rotate" />
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .my-ol {
    padding-inline-start: 40px;
  }

  .lower-alpha {
    list-style-type: lower-alpha;
  }
</style>
